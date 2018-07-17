import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { Dictionary } from "../../../types";
import { CollectorUtil } from "../../../utils";
import { UsersCollector } from './users';

export class UserPoliciesCollector extends BaseCollector {
    collect() {
        return this.listPolicies();
    }

    private async listPolicies() {
        try {
            const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
            const usersData = await CollectorUtil.cachedCollect(new UsersCollector());
            const users: AWS.IAM.User[] = usersData.users;
            const user_policies: Dictionary<AWS.IAM.AttachedPolicy[]> = {};
            for (let i = 0; i < users.length; i++) {
                const userName = users[i].UserName
                let fetchPending = true;
                let marker: string | undefined;
                let userPolicies: AWS.IAM.AttachedPolicy[] = [];
                while (fetchPending) {
                    let params: AWS.IAM.ListAttachedUserPoliciesRequest = { UserName: userName }
                    if (marker) {
                        params.Marker = marker;
                    }
                    let policiesData: AWS.IAM.ListAttachedUserPoliciesResponse = await iam.listAttachedUserPolicies(params).promise();
                    if (policiesData.AttachedPolicies) {
                        userPolicies = userPolicies.concat(policiesData.AttachedPolicies);
                    }
                    marker = policiesData.Marker;
                    fetchPending = policiesData.IsTruncated === true
                }
                user_policies[userName] = userPolicies;
            }
            return { user_policies };
        } catch (error) {
            console.error(error);
        }
    }
}