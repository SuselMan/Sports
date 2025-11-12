import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ApplicationProvider, Layout, Text, List, ListItem, IconRegistry } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Muscles } from './src/shared/Shared.model';
import { SafeAreaView, View } from 'react-native';

export default function App() {
  const muscles = useMemo(() => Object.values(Muscles), []);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <SafeAreaView style={{ flex: 1 }}>
          <Layout style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text category='h5'>Muscles (stub)</Text>
              <Text appearance='hint' category='s1'>
                Временная заглушка списка мышц. В следующей версии заменим на MuscleMap.
              </Text>
            </View>
            <List
              data={muscles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => <ListItem title={item} />}
            />
          </Layout>
        </SafeAreaView>
        <StatusBar style="auto" />
      </ApplicationProvider>
    </>
  );
}


