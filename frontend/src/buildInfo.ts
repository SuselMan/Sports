import buildInfoJson from './buildInfo.json';

export const frontendBuildNumber: number = (buildInfoJson as { build?: number }).build ?? 1;

