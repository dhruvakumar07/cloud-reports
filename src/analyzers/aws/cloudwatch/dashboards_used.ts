import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class DashboardsUsageAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allDashboards: any[] = params.dashboards;
        if (!allDashboards) {
            return undefined;
        }
        const dashboards_used: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        dashboards_used.what = "Are CloudWatch Dashboards being used?";
        dashboards_used.why = "We need to monitor our applications and infrastructure with various metrics and dashboards help us to quickly glance at these graphs"
        dashboards_used.recommendation = "Recommended to use dashboards for various important metrics such as Errors, Latency and CPU Utilization etc";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allDashboards) {
            let regionDashboards = allDashboards[region];
            allRegionsAnalysis[region] = [];
            let dashboardAnalysis: ResourceAnalysisResult = {};

            if(regionDashboards && regionDashboards.length) {
                dashboardAnalysis.resource = regionDashboards;
                dashboardAnalysis.resourceSummary = {
                    name: 'Dashboards',
                    value: this.getDashboardNames(regionDashboards).join(", ")
                }
                dashboardAnalysis.severity = SeverityStatus.Good;
                dashboardAnalysis.message = 'Dashboards are being used';

            } else {
                dashboardAnalysis.resource = {};
                dashboardAnalysis.resourceSummary = {
                    name: 'Dashboards',
                    value: "None"
                };
                dashboardAnalysis.severity = SeverityStatus.Warning;
                dashboardAnalysis.message = 'Dashboards are not being used';
                dashboardAnalysis.action = 'Create dashboards for various performance metrics';
            }
            allRegionsAnalysis[region].push(dashboardAnalysis)
        }
        dashboards_used.regions = allRegionsAnalysis;
        return { dashboards_used };
    }

    private getDashboardNames(dashboards) {
        if(!dashboards) {
            return [];
        }
        return dashboards.map((dashboard) => {
            return dashboard.DashboardName;
        });
    }
}