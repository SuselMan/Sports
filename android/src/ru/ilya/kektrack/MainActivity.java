package ru.ilya.kektrack;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.webkit.*;
import android.net.Uri;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private String backupText;
    private static final String HOST="appassets.androidplatform.net";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        if((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE)!=0)WebView.setWebContentsDebuggingEnabled(true);
        web=new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new Sender(),"KektrackNative");
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);
                fileCallback=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("*/*");
                startActivityForResult(intent,2);return true;
            }
        });
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return !HOST.equals(request.getUrl().getHost());}
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();
                if (!HOST.equals(uri.getHost()) || !"https".equals(uri.getScheme())) return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));
                String path=uri.getPath();
                if(path==null || path.contains(".."))return null;
                String file=path.substring(1);
                if(file.isEmpty() || !file.substring(file.lastIndexOf('/')+1).contains("."))file="index.html";
                String mime=file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":file.endsWith(".html")?"text/html":file.endsWith(".svg")?"image/svg+xml":file.endsWith(".png")?"image/png":file.endsWith(".json")||file.endsWith(".webmanifest")?"application/json":"application/octet-stream";
                try{return new WebResourceResponse(mime,"UTF-8",getAssets().open("web/"+file));}
                catch(IOException e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));}
            }
        });
        setContentView(web);
        // Insets keep controls away from system bars with Android 15 edge-to-edge.
        web.setOnApplyWindowInsetsListener((view,insets)->{view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        web.loadUrl("https://"+HOST+"/");
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==2 && fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK && data!=null?new Uri[]{data.getData()}:null);fileCallback=null;}
        if(request==3 && result==RESULT_OK && data!=null && backupText!=null){
            try(OutputStream stream=getContentResolver().openOutputStream(data.getData())){stream.write(backupText.getBytes(StandardCharsets.UTF_8));}
            catch(IOException e){android.widget.Toast.makeText(this,"Не удалось сохранить копию",android.widget.Toast.LENGTH_LONG).show();}
        }
        if(request==3)backupText=null;
    }
    @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
    @Override public void onDestroy(){web.removeJavascriptInterface("KektrackNative");web.destroy();executor.shutdown();super.onDestroy();}
    private final java.util.concurrent.ExecutorService executor=Executors.newSingleThreadExecutor();
    private class Sender {
        @JavascriptInterface public void backup(String text){runOnUiThread(()->{backupText=text;Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("application/json");intent.putExtra(Intent.EXTRA_TITLE,"kektrack-backup.json");startActivityForResult(intent,3);});}
        @JavascriptInterface public void send(String id,String endpoint,String token,String body){
            executor.execute(()->{
                boolean ok=false;String message="Не удалось отправить данные. Проверь сеть и настройки.";
                HttpURLConnection conn=null;
                try{
                    URI uri=new URI(endpoint);
                    if(!"https".equals(uri.getScheme()) || uri.getUserInfo()!=null || uri.getHost()==null || !uri.getPath().endsWith("/api/kektrack"))throw new IOException("Invalid endpoint");
                    byte[] bytes=body.getBytes(StandardCharsets.UTF_8);
                    if(bytes.length>8*1024*1024)throw new IOException("Too large");
                    conn=(HttpURLConnection)uri.toURL().openConnection();
                    conn.setInstanceFollowRedirects(false);conn.setConnectTimeout(15000);conn.setReadTimeout(20000);
                    conn.setRequestMethod("POST");conn.setDoOutput(true);conn.setFixedLengthStreamingMode(bytes.length);
                    conn.setRequestProperty("Content-Type","application/json");conn.setRequestProperty("X-Webhook-Token",token);
                    try(OutputStream stream=conn.getOutputStream()){stream.write(bytes);}
                    int code=conn.getResponseCode();
                    if(code==200){
                        ByteArrayOutputStream response=new ByteArrayOutputStream();
                        try(InputStream input=conn.getInputStream()){byte[] buffer=new byte[1024];int n;while((n=input.read(buffer))!=-1){response.write(buffer,0,n);if(response.size()>65536)throw new IOException("Response too large");}}
                        ok=new JSONObject(response.toString("UTF-8")).optBoolean("ok",false);
                    }else message=code==401?"Токен не принят. Проверь страницу подключения.":"Сервер отклонил отправку ("+code+").";
                }catch(Exception e){/* Do not expose credentials or private endpoint in errors. */}
                finally{if(conn!=null)conn.disconnect();}
                final boolean accepted=ok;final String text=message;
                runOnUiThread(()->{if(!isDestroyed())web.evaluateJavascript("window.__kektrackReply && window.__kektrackReply("+JSONObject.quote(id)+","+accepted+","+JSONObject.quote(text)+")",null);});
            });
        }
    }
}
