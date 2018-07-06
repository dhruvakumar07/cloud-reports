import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class CloudTrailsLogValidationAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_log_validation: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        cloud_trails_log_validation.what = "Is log file validation enabled for cloud trails?";
        cloud_trails_log_validation.why = "Cloud trails helps understand who did what so enabling log file validation keep their integrity intact"
        cloud_trails_log_validation.recommendation = "Recommended to enable log file validation for all cloud trails";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allTrails) {
            let regionTrails = allTrails[region];
            allRegionsAnalysis[region] = [];
            for (let trail of regionTrails) {
                let trail_analysis: ResourceAnalysisResult = {};
                trail_analysis.resource = trail;
                trail_analysis.resourceSummary = {
                    name: 'CloudTrail', value: trail.Name
                };
                if (trail.LogFileValidationEnabled) {
                    trail_analysis.severity = SeverityStatus.Good;
                    trail_analysis.message = 'Log validation is enabled for the cloud trail';
                } else {
                    trail_analysis.severity = SeverityStatus.Failure;
                    trail_analysis.message = 'Log validation is not enabled for the cloud trail';
                    trail_analysis.action = 'Enable cloud trail log validation for log file integrity'
                }
                allRegionsAnalysis[region].push(trail_analysis);
            }
        }
        cloud_trails_log_validation.regions = allRegionsAnalysis;
        return { cloud_trails_log_validation };
    }
}