import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class DnsQueryLogsConfigAnalyzer extends BaseAnalyzer {

    analyze(params: any): any {
        const allHostZoneQueryLogsConfig = params.query_logs_config;
        const allHostedZones = params.hosted_zones;
        if (!allHostZoneQueryLogsConfig || !allHostedZones) {
            return undefined;
        }
        const dns_query_logs_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        dns_query_logs_enabled.what = "Is DNS Query Logs enabled for Hosted Zones?";
        dns_query_logs_enabled.why = "DNS query logs provides insights into who and how is domain is getting accessed and this helps to enable proper security controls"
        dns_query_logs_enabled.recommendation = "Recommended to enable query logs for all hosted zones.";
        const allHostZonesAnalysis: ResourceAnalysisResult[] = [];
        const allHostZoneQueryLogsConfigMapByHostedZoneId = this.getHostZoneQueryLogsConfigMapByHostedZoneId(allHostZoneQueryLogsConfig);
        for (let hostedZone of allHostedZones) {
            let hosted_analysis: ResourceAnalysisResult = {};
            let hostedSimpleZoneId = hostedZone.Id.replace("/hostedzone/", "");
            hosted_analysis.resource = { hostedZone, query_log_config: allHostZoneQueryLogsConfigMapByHostedZoneId[hostedSimpleZoneId] };
            hosted_analysis.resourceSummary = {
                name: 'HostedZone', value: hostedZone.Name
            };
            if (allHostZoneQueryLogsConfigMapByHostedZoneId[hostedSimpleZoneId]) {
                hosted_analysis.severity = SeverityStatus.Good;
                hosted_analysis.message = "Query logs are already enabled";
            } else {
                hosted_analysis.severity = SeverityStatus.Failure;
                hosted_analysis.message = "Query logs are not enabled";
                hosted_analysis.action = "Enable query logs for the hosted zone";
            }
            allHostZonesAnalysis.push(hosted_analysis);
        }
        dns_query_logs_enabled.regions = { global: allHostZonesAnalysis };
        return { dns_query_logs_enabled };
    }

    private getHostZoneQueryLogsConfigMapByHostedZoneId(allHostZoneQueryLogsConfig: any[]) {
        return allHostZoneQueryLogsConfig.reduce((configMap, config) => {
            configMap[config.HostedZoneId] = config;
            return configMap;
        }, {})
    }
}