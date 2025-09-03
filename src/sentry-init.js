// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const Sentry = require('@sentry/node');

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [
	    // Profiling
		nodeProfilingIntegration(),
        // Send console logs to Sentry
		Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
	],
	// Profiling
	profileLifecycle: 'trace',
	profileSessionSampleRate: parseFloat(process.env.SENTRY_PROFILING_RATE?? 1.0),

	// Logging
	enableLogs: process.env.SENTRY_LOGGING === 'true'´,
	
	// Setting this option to true will send default PII data to Sentry.
	// For example, automatic IP address collection on events
	sendDefaultPii: true,
	// Tracing
	tracesSampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE?? 0.1), //  Capture 10% of the transactions
});
