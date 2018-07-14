import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class RdsAutomatedBackupsEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const automated_backups_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        automated_backups_enabled.what = "Is Automated backup enabled for RDS instances?";
        automated_backups_enabled.why = "It is important to enabled automated backups so that incase of hardware failures and accidental data loss, we can recover data."
        automated_backups_enabled.recommendation = "Recommended to enable automated backups for all RDS instances.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instance_analysis: ResourceAnalysisResult = {};
                instance_analysis.resource = instance;
                instance_analysis.resourceSummary = {
                    name: 'Instance',
                    value: instance.DBInstanceIdentifier
                }
                if (instance.BackupRetentionPeriod > 0) {
                    instance_analysis.severity = SeverityStatus.Good;
                    instance_analysis.message = 'Automated backup is enabled';
                } else {
                    instance_analysis.severity = SeverityStatus.Failure;
                    instance_analysis.message = 'Automated backup is not enabled';
                    instance_analysis.action = 'Enable Automated backup'
                }
                allRegionsAnalysis[region].push(instance_analysis);
            }
        }
        automated_backups_enabled.regions = allRegionsAnalysis;
        return { automated_backups_enabled };
    }
}