import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class PasswordPolicyCollector extends BaseCollector {
    async collect() {
        try {
            const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
            const passwordPolicyResponse: AWS.IAM.GetAccountPasswordPolicyResponse = await iam.getAccountPasswordPolicy().promise();
            const password_policy = passwordPolicyResponse.PasswordPolicy;
            return { password_policy };
        } catch (error) {
            console.error(error);
        }
    }
}
