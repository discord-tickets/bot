/* eslint-disable no-console */
const fs = require('fs');
const {
	Composer,
	LineCounter,
	Parser,
} = require('yaml');

function resolve(ast, key) {
	return key
		.split('.')
		.reduce(
			(acc, part) => acc.value.items.find(item => item.key.source === part),
			ast,
		);
}

const errors = [];
const locales = [];
const files = fs.readdirSync('./src/i18n').filter(file => file.endsWith('.yml'));

for (const file of files) {
	const locale = file.substring(0, file.length - 4);
	locales.push(locale);
	const content = fs.readFileSync(`./src/i18n/${file}`, 'utf8');
	const lineCounter = new LineCounter();
	const parser = new Parser(lineCounter.addNewLine);
	const tokenGenerator = parser.parse(content);
	// Unfortunately needs to be parsed twice because `Generator<Token>` is single-use?
	// Might as well use the simpler YAML.parse() instead of the Composer but I've already written this.
	const [ast] = Array.from(parser.parse(content));
	const docs = new Composer().compose(tokenGenerator);
	const [doc] = Array.from(docs, doc => doc.toJS());

	/**
	 * Message context menu commands
	 */

	for (const [key, command] of Object.entries(doc.commands?.message || {})) {
		if (command.name?.length > 32) {
			const searchKey = `commands.message.${key}.name`;
			const {
				col,
				line,
			} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
			errors.push({
				col,
				line,
				locale,
				message: `\`${searchKey}\` is too long (${command.name.length} > 32)`,
			});
		}
	}

	/**
	 * Chat input (slash) commands
	 */

	for (const [key, command] of Object.entries(doc.commands?.slash || {})) {

		const regex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

		if (command.name) {
			if (!regex.test(command.name)) {
				const searchKey = `commands.slash.${key}.name`;
				const {
					col,
					line,
				} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
				errors.push({
					col,
					line,
					locale,
					message: `\`${searchKey}\` does not match the regex pattern \`${regex.toString()}\``,
				});
			}

			if (command.name !== command.name.toLocaleLowerCase()) {
				const searchKey = `commands.slash.${key}.name`;
				const {
					col,
					line,
				} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
				errors.push({
					col,
					line,
					locale,
					message: `\`${searchKey}\` is not lowercase`,
				});
			}
		}

		if (command.description?.length > 100) {
			const searchKey = `commands.slash.${key}.description`;
			const {
				col,
				line,
			} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
			errors.push({
				col,
				line,
				locale,
				message: `\`${searchKey}\` is too long (${command.description.length} > 100)`,
			});
		}

		for (const [key2, option] of Object.entries(command.options || {})) {
			if (option.name) {
				if (!regex.test(option.name)) {
					const searchKey = `commands.slash.${key}.options.${key2}.name`;
					const {
						col,
						line,
					} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
					errors.push({
						col,
						line,
						locale,
						message: `\`${searchKey}\` does not match the regex pattern "${regex.toString()}"`,
					});
				}

				if (option.name !== option.name.toLocaleLowerCase()) {
					const searchKey = `commands.slash.${key}.options.${key2}.name`;
					const {
						col,
						line,
					} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
					errors.push({
						col,
						line,
						locale,
						message: `\`${searchKey}\` is not lowercase`,
					});
				}
			}

			if (option.description?.length > 100) {
				const searchKey = `commands.slash.${key}.options.${key2}.description`;
				const {
					col,
					line,
				} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
				errors.push({
					col,
					line,
					locale,
					message: `\`${searchKey}\` is too long (${option.description.length} > 100)`,
				});
			}
		}
	}

	/**
	 * User context menu commands
	 */

	for (const [key, command] of Object.entries(doc.commands?.user || {})) {
		if (command.name?.length > 32) {
			const searchKey = `commands.user.${key}.name`;
			const {
				col,
				line,
			} = lineCounter.linePos(resolve(ast, searchKey).value.offset);
			errors.push({
				col,
				line,
				locale,
				message: `\`${searchKey}\` is too long (${command.name.length} > 32)`,
			});
		}
	}

}

// @actions/core:
// https://github.blog/2022-05-09-supercharging-github-actions-with-job-summaries/

async function summarise() {
	const { markdownTable } = await import('markdown-table');
	const branch = process.env.GITHUB_SHA || 'main';
	let summary = '# Test results\n\n';
	summary +=
		markdownTable([
			['Locale', 'Result'],
			...locales.map(locale => [
				`\`${locale}\``,
				errors.filter(error => error.locale === locale).length === 0 ? '✅ Passed' : '❌ Failed',
			]),
		]) + '\n\n';

	for (const locale of locales) {
		// thanks copilot
		console.log(`::group::${locale}`);
		const localeErrors = errors.filter(error => error.locale === locale);

		summary += `## \`${locale}\`\n\n`;

		if (localeErrors.length > 0) {
			for (const error of localeErrors) {
				summary += `https://github.com/discord-tickets/bot/blob/${branch}/src/i18n/${locale}.yml#L${error.line}\n\n`;
				console.log(`::error file=src/i18n/${locale}.yml,line=${error.line},col=${error.col}::${error.message}`);
			}
		} else {
			summary += 'No errors found\n\n';
			// console.log(`::notice file=src/i18n/${locale}.yml::No errors found`);
		}

		console.log('::endgroup::');
	}

	fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY || 'summary.md', summary);

	if (errors.length > 0) {
		console.error('Failed with %d errors', errors.length);
		process.exit(1);
	}
}

summarise();
