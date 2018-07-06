import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

export class PasswordPolicyAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const password_policy_report = params.password_policy;

        const password_policy: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        password_policy.what = "Is account password policy following best practices?";
        password_policy.why = "It is important to have secure password policy as leaked or weak passwords can give direct access to attackers"
        password_policy.recommendation = "Recommended to have secure password policy";
        const analysis: ResourceAnalysisResult[] = [];

        if (!password_policy_report) {
            analysis.push({
                severity: SeverityStatus.Failure,
                message: 'Account does not have password policy',
                action: "Add strong password policy for the account",
                resourceSummary: {
                    name: 'Resource',
                    value: 'Password Policy'
                }
            });
            password_policy.regions = { global: analysis };
            return { password_policy };
        }

        const minimumPasswordLengthAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Minimum Password Length",
                name: "Option"
            }
        }
        if (password_policy_report.MinimumPasswordLength < 8) {
            minimumPasswordLengthAnalysis.severity = SeverityStatus.Failure;
            minimumPasswordLengthAnalysis.message = "Password length should at least 8";
            minimumPasswordLengthAnalysis.action = "Set this to 8";
        } else {
            minimumPasswordLengthAnalysis.severity = SeverityStatus.Good;
            minimumPasswordLengthAnalysis.message = "This has a recommended value";
        }
        analysis.push(minimumPasswordLengthAnalysis);


        const passwordRequireSymbolsAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Require Symbols",
                name: "Option"
            }
        }
        if (!password_policy_report.RequireSymbols) {
            passwordRequireSymbolsAnalysis.severity = SeverityStatus.Failure;
            passwordRequireSymbolsAnalysis.message = "Strong password requires symbols";
            passwordRequireSymbolsAnalysis.action = "Enable this";
        } else {
            passwordRequireSymbolsAnalysis.severity = SeverityStatus.Good;
            passwordRequireSymbolsAnalysis.message = "Already Enabled";
        }
        analysis.push(passwordRequireSymbolsAnalysis);

        const passwordRequireNumbersAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                name: "Option",
                value:  `Require Numbers`
            }
        }
        if (!password_policy_report.RequireNumbers) {
            passwordRequireNumbersAnalysis.severity = SeverityStatus.Failure;
            passwordRequireNumbersAnalysis.message = "Strong password requires numbers";
            passwordRequireNumbersAnalysis.action = "Enable this";
        } else {
            passwordRequireNumbersAnalysis.severity = SeverityStatus.Good;
            passwordRequireNumbersAnalysis.message = "Already Enabled";
        }
        analysis.push(passwordRequireNumbersAnalysis);

        const passwordRequireUppercaseCharactersAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Require Uppercase Characters",
                name: "Option"
            }
        }
        if (!password_policy_report.RequireUppercaseCharacters) {
            passwordRequireUppercaseCharactersAnalysis.severity = SeverityStatus.Failure;
            passwordRequireUppercaseCharactersAnalysis.message = "Strong password requires upper case letters";
            passwordRequireUppercaseCharactersAnalysis.action = "Enable this";
        } else {
            passwordRequireUppercaseCharactersAnalysis.severity = SeverityStatus.Good;
            passwordRequireUppercaseCharactersAnalysis.message = "Already Enabled";
        }
        analysis.push(passwordRequireUppercaseCharactersAnalysis);

        const passwordRequireLowercaseCharactersAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Require Lowercase Characters",
                name: "Option"
            }
        }
        if (!password_policy_report.RequireLowercaseCharacters) {
            passwordRequireLowercaseCharactersAnalysis.severity = SeverityStatus.Failure;
            passwordRequireLowercaseCharactersAnalysis.message = "Strong password requires lower case letters";
            passwordRequireLowercaseCharactersAnalysis.action = "Enable this";
        } else {
            passwordRequireLowercaseCharactersAnalysis.severity = SeverityStatus.Good;
            passwordRequireLowercaseCharactersAnalysis.message = "Already Enabled";
        }
        analysis.push(passwordRequireLowercaseCharactersAnalysis);


        const expirePasswordsAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Expire Passwords",
                name: "Option"
            }
        }
        if (!password_policy_report.ExpirePasswords) {
            expirePasswordsAnalysis.severity = SeverityStatus.Failure;
            expirePasswordsAnalysis.message = "To enforce regular change of passwords, it should be expired after certian time";
            expirePasswordsAnalysis.action = "Enable this";
        } else {
            expirePasswordsAnalysis.severity = SeverityStatus.Good;
            expirePasswordsAnalysis.message = "Already Enabled";
        }
        analysis.push(expirePasswordsAnalysis);

        const maxPasswordAgeAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Max Password Age",
                name: "Option"
            }
        }
        if (!password_policy_report.MaxPasswordAge) {
            maxPasswordAgeAnalysis.severity = SeverityStatus.Failure;
            maxPasswordAgeAnalysis.message = "Password should be change at lease once in 90 days";
            maxPasswordAgeAnalysis.action = "Set this to 90";
        } else {
            maxPasswordAgeAnalysis.severity = SeverityStatus.Good;
            maxPasswordAgeAnalysis.message = "This has a recommended value";
        }
        analysis.push(maxPasswordAgeAnalysis);

        const passwordReusePreventionAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Password Reuse Prevention",
                name: "Option"
            }
        }
        if (!password_policy_report.PasswordReusePrevention) {
            passwordReusePreventionAnalysis.severity = SeverityStatus.Failure;
            passwordReusePreventionAnalysis.message = "New password shouldn't be same as at least last 3 used passwords";
            passwordReusePreventionAnalysis.action = "Set this to 3";
        } else {
            passwordReusePreventionAnalysis.severity = SeverityStatus.Good;
            passwordReusePreventionAnalysis.message = "This has a recommended value";
        }
        analysis.push(passwordReusePreventionAnalysis);


        const passwordHardExpiryAnalysis: ResourceAnalysisResult = {
            resourceSummary: {
                value: "Hard Expiry",
                name: "Option"
            }
        }
        if (!password_policy_report.HardExpiry) {
            passwordHardExpiryAnalysis.severity = SeverityStatus.Warning;
            passwordHardExpiryAnalysis.message = "User should contact the admin to reset the expired password";
            passwordHardExpiryAnalysis.action = "Set this to true. Use caution here if there is only admin for your account then don't set this";
        } else {
            passwordHardExpiryAnalysis.severity = SeverityStatus.Good;
            passwordHardExpiryAnalysis.message = "This has a recommended value";
        }
        analysis.push(passwordHardExpiryAnalysis);
        password_policy.regions = { global: analysis };
        return { password_policy };
    }
}