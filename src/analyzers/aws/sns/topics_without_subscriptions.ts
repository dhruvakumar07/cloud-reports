import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class TopicsWithoutSubscriptionsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allSubscriptions = params.subscriptions;
        const allTopics = params.topics;

        if (!allTopics || !allSubscriptions) {
            return undefined;
        }
        const topics_without_subscriptions: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        topics_without_subscriptions.what = "Are there any SNS topics without subscriptions?";
        topics_without_subscriptions.why = "Topics without subscriptions cause confusion as mistakenly we might be publishing to them but no one will receive them"
        topics_without_subscriptions.recommendation = "Every SNS topic should have proper subscriptions else you should remove it";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allTopics) {
            let regionTopics = allTopics[region];
            let regionSubscriptionsMap = this.mapSubscriptionByTopicArn(allSubscriptions[region]);

            allRegionsAnalysis[region] = [];
            for (let topic of regionTopics) {
                let topic_analysis: ResourceAnalysisResult = {};
                let topicName = this.getTopicName(topic.TopicArn);
                topic_analysis.resource = {topicName,  subscriptions: regionSubscriptionsMap[topic.TopicArn] };
                topic_analysis.resourceSummary = {
                    name: 'Topic', value: topicName
                }
                if (regionSubscriptionsMap[topic.TopicArn] && regionSubscriptionsMap[topic.TopicArn].length) {
                    topic_analysis.severity = SeverityStatus.Good;
                    topic_analysis.message = 'Topic has subscriptions';
                } else {
                    topic_analysis.severity = SeverityStatus.Warning;
                    topic_analysis.message = 'Topic does not have any subscriptions';
                    topic_analysis.action = 'Either add subscription or delete the topic'
                }

                allRegionsAnalysis[region].push(topic_analysis);
            }
        }
        topics_without_subscriptions.regions = allRegionsAnalysis;
        return { topics_without_subscriptions };
    }

    private mapSubscriptionByTopicArn(subscriptions: any[]): Dictionary<any[]> {
        return subscriptions.reduce((subscriptionsMap, subscription) => {
            subscriptionsMap[subscription.TopicArn] = subscriptionsMap[subscription.TopicArn] || [];
            subscriptionsMap[subscription.TopicArn].push(subscription);
            return subscriptionsMap;
        }, {});
    }

    private getTopicName(topicArn: string): string {
        return topicArn.split(":").pop() as string;
    }
}