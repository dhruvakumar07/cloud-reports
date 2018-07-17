import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class GroupsAnalyzerAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allGroupUsers: Dictionary<any[]> = params.group_users;
        const allUsers: any[] = params.users;

        if (!allGroupUsers || !allGroupUsers) {
            return undefined;
        }
        const iam_groups_used: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        iam_groups_used.what = "Are IAM groups used for granting permissions?";
        iam_groups_used.why = "When we use IAM groups to grant access to IAM users then it will be easy to manage access control"
        iam_groups_used.recommendation = "Recommended to user IAM groups for granting access to the users";
        const groupsByUser = this.mapGroupsByUser(allGroupUsers);
        const allUserAnalysis: ResourceAnalysisResult[] = [];
        for (let user of allUsers) {
            let userAnalysis: ResourceAnalysisResult = {};
            userAnalysis.resource = { user, groups: groupsByUser[user.UserName] };
            userAnalysis.resourceSummary = {
                name: 'User',
                value: user.UserName
            }
            if (groupsByUser[user.UserName] && groupsByUser[user.UserName].length) {
                userAnalysis.severity = SeverityStatus.Good;
                userAnalysis.message = `Use belongs to ${groupsByUser[user.UserName].join(", ")} groups`
            } else {
                userAnalysis.severity = SeverityStatus.Failure;
                userAnalysis.message = "User doesn't belong to any group"
                userAnalysis.action = "Use groups for granting access to the users"
            }
            allUserAnalysis.push(userAnalysis);
        }

        iam_groups_used.regions = { global: allUserAnalysis };
        return { iam_groups_used }
    }

    private mapGroupsByUser(groups: Dictionary<any[]>) {
        return Object.keys(groups).reduce((groupsMap, groupName) => {
            let groupUsers = groups[groupName];
            if (groupUsers && groupUsers.length) {
                groupUsers.forEach((user) => {
                    groupsMap[user.UserName] = groupsMap[user.UserName] || [];
                    groupsMap[user.UserName].push(groupName);
                });
            }
            return groupsMap;
        }, {});
    }
}