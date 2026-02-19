import { inspect } from "util";
import * as core from "@actions/core";
import { App, Octokit } from "octokit";

// export for testing
export default main();

async function main() {
  try {
    const app = new App({
      appId: +core.getInput("app_id"),
      privateKey: core.getInput("private_key"),
      Octokit: Octokit.defaults({
        userAgent: "gr2m/notifier-action",
      }),
    });
    const eventType = core.getInput("event_type");
    const eventPayload = JSON.parse(core.getInput("event_payload"));

    core.info(`ℹ️  Repository dispatch event type: "${eventType}"`);
    core.debug(
      `ℹ️  event client payload: ${inspect(eventPayload, { depth: Infinity })}`,
    );

    await app.eachRepository(async ({ octokit, repository }) => {
      const owner = repository.owner.login;
      const repoUrl = repository.private
        ? `${owner}/[private]`
        : repository.html_url;

      core.debug(`ℹ️  Dispatching event for ${repoUrl} (id: ${repository.id})`);
      try {
        await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
          owner,
          repo: repository.name,
          event_type: eventType,
          client_payload: eventPayload,
        });

        core.info(
          `✅  Event dispatched successfully for ${repoUrl} (id: ${repository.id})`,
        );
      } catch (error) {
        core.warning(
          `⚠️  Dispatch error: ${inspect(error, { depth: Infinity })}`,
        );
      }
    });
  } catch (error) {
    core.debug(inspect(error, { depth: Infinity }));
    core.setFailed(error.message);
  }
}
