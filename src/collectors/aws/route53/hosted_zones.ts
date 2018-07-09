import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class HostedZonesCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllHostedZones();
    }

    private async listAllHostedZones() {
        const route53 = this.getClient('Route53', 'us-east-1') as AWS.Route53;
        let fetchPending = true;
        let marker: string | undefined = undefined;
        let hosted_zones: AWS.Route53.HostedZone[] = [];
        while (fetchPending) {
            let route53HostedZonesData: AWS.Route53.ListHostedZonesResponse = await route53.listHostedZones({ Marker: marker }).promise();
            hosted_zones = hosted_zones.concat(route53HostedZonesData.HostedZones);
            marker = route53HostedZonesData.NextMarker;
            fetchPending = marker !== undefined;
        }
        return { hosted_zones };
    }
}