import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class VirtualMFADevicesCollector extends BaseCollector {
    private iam = new AWS.IAM({ region: 'us-east-1' });
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listVirtualMFADevices();
    }

    private async listVirtualMFADevices() {
        try {
            const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
            let fetchPending = true;
            let marker: string | undefined = undefined;
            let mfaVirtualDevices: AWS.IAM.VirtualMFADevice[] = [];
            while (fetchPending) {
                let iamMfaDevicesData: AWS.IAM.ListVirtualMFADevicesResponse = await iam.listVirtualMFADevices({ Marker: marker }).promise();
                mfaVirtualDevices = mfaVirtualDevices.concat(iamMfaDevicesData.VirtualMFADevices);
                marker = iamMfaDevicesData.Marker;
                fetchPending = iamMfaDevicesData.IsTruncated === true;
            }
            return { mfaVirtualDevices };
        } catch (error) {
            console.error(error);
        }
    }
}