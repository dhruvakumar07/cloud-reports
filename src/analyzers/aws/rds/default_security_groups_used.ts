import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class DefaultSecurityGroupsUsedAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!fullReport['aws.ec2'] || !fullReport['aws.ec2'].security_groups || !allInstances) {
            return undefined;
        }
        
        const allVpcSecurityGroups = fullReport['aws.ec2'].security_groups;

        const default_security_groups_used: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        default_security_groups_used.what = "Are there any default security groups used for RDS instances?";
        default_security_groups_used.why = "Default security groups are open to world by default and requires extra setup make them secure"
        default_security_groups_used.recommendation = "Recommended not to use default security groups instead create a custom one as they make you better understand the security posture";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionSecurityGroups = allVpcSecurityGroups[region];
            let defaultSecurityGroups = this.getDefaultSecurityGroups(regionSecurityGroups);
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let instanceAnalysis: ResourceAnalysisResult = {};
                instanceAnalysis.resource = { instanceName: instance.DBInstanceIdentifier, security_groups: instance.VpcSecurityGroups } ;
                instanceAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: instance.DBInstanceIdentifier
                }
                if (this.isCommonSecurityGroupExist(defaultSecurityGroups, instance.VpcSecurityGroups)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = 'Default security groups are used';
                    instanceAnalysis.action = 'Use custom security group instead default security group';
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = 'Default security groups are not used';
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        default_security_groups_used.regions = allRegionsAnalysis;
        return { default_security_groups_used };
    }

    private getDefaultSecurityGroups(securityGroups: any[]) {
        return securityGroups.filter((securityGroup) => {
            return securityGroup.GroupName === 'default';
        });
    }

    private isCommonSecurityGroupExist(securityGroups1, vpcSecurityGroups2) {
        const commonSecurityGroups = securityGroups1.filter((securityGroup1) => {
            return vpcSecurityGroups2.filter((securityGroup2) => {
                return securityGroup1.GroupId === securityGroup2.VpcSecurityGroupId;
            }).length > 0;
        });
        return commonSecurityGroups.length > 0;
    }
}