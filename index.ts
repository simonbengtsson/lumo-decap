import { parse } from "yaml";

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    try {
      const pathname = url.pathname;

      if (pathname === "/setup") {
        return await getSetupResponse(request, env);
      }
      return await getDecapResponse(request, env);
    } catch (error) {
      const errorMessage =
        error instanceof AppError
          ? error.message
          : "Something went wrong when loading decap. Please check the config values and try again.";
      return Response.redirect(
        `${url.origin}/setup?error=${encodeURIComponent(errorMessage)}`,
        302
      );
    }
  },
};

async function getSetupResponse(request: Request, env: any) {
  if (request.method === "GET") {
    return new Response(getSetupHtml(request), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } else if (request.method === "POST") {
    const formData = await request.formData();
    const githubRepository = formData.get("githubRepository");
    const githubToken = formData.get("githubToken");

    if (!githubRepository || !githubToken) {
      throw new AppError("Invalid github repository or token");
    }

    await env.MAINDB.put("githubRepository", githubRepository);
    await env.MAINDB.put("githubToken", githubToken);

    const url = new URL(request.url);
    url.pathname = "/";
    return Response.redirect(url.toString());
  }
}

async function getDecapResponse(request: Request, env: any) {
  const githubRepository = await env.MAINDB.get("githubRepository");
  const githubToken = await env.MAINDB.get("githubToken");

  if (!githubRepository || !githubToken) {
    const url = new URL(request.url);
    url.pathname = "/setup";
    return Response.redirect(url.toString(), 303);
  }

  let decapJsonConfig = await getDecapConfig(githubRepository, githubToken);

  const html = /*html*/ `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="robots" content="noindex" />
          <title>Decap CMS</title>
      </head>
      <body>
        <script>
          window.DECAP_CONFIG = ${JSON.stringify(decapJsonConfig)}
          window.CMS_MANUAL_INIT = true
        </script>
        <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
        <script src="/client.js"></script>
      </body>
      </html>
      `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

async function getDecapConfig(
  githubRepositoryUrl: string,
  githubToken: string
) {
  const decapConfigFilename = "decapconfig.yml";
  const content = await fetchGithubFileContent(
    githubRepositoryUrl,
    githubToken,
    decapConfigFilename
  );
  const decapJsonConfig = { ...parse(content) };

  if (!decapJsonConfig.collections) {
    throw new AppError("No backend found in decapconfig.yml");
  }

  if (!decapJsonConfig.backend) {
    decapJsonConfig.backend = {};
  }

  decapJsonConfig.backend.name = "lumo";
  decapJsonConfig.backend.repo = githubRepositoryUrl;
  decapJsonConfig.load_config_file = false;
  decapJsonConfig.githubToken = githubToken;

  return decapJsonConfig;
}

async function fetchGithubFileContent(
  githubRepositoryUrl: string,
  githubToken: string,
  filename: string
) {
  const [owner, repo] = githubRepositoryUrl
    .split("/")
    .filter(Boolean)
    .slice(-2);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "Lumobase Decap CMS",
    },
  });

  if (!response.ok) {
    throw new AppError(
      `Could not fetch ${filename} from GitHub. Please check the repository URL and token and try again.`
    );
  }

  const text = await response.text();
  return text;
}

function getSetupHtml(request: Request) {
  const url = new URL(request.url);
  const errorMessage = url.searchParams.get("error");

  return /*html*/ `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Setup Decap CMS</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
  </head>
  <body>
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 600px; margin: 0 auto; padding: 2rem;">
    ${
      errorMessage
        ? `
    <div style="background-color: #fee; border: 1px solid #fcc; padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0;">Oops!</h3>
      <p>${errorMessage}</p>
    </div>
    `
        : ""
    }
      <h1 style="margin-bottom: 0;">Setup Decap CMS</h1>
      <p style="margin-top: 0;">
        Before you continue you need a website in a GitHub repository that preferably deploys when new commits are pushed. You can check <a href="https://github.com/simonbengtsson/lumo-decap-vitepress?tab=readme-ov-file#vitepress-with-decap-cms-as-lumo-app" target="_blank">this README</a> for example instructions.
      </p>
      <form method="POST">
      <div>
        <label for="githubRepository"><strong>GitHub Repository URL</strong></label><br>
        <input style="width: 100%;" type="text" name="githubRepository" required />
        <p>
          Full URL to the public or private repository of your website. There should be a <code>decapconfig.yml</code> file at the root, but no decap <code>/admin</code> folder is needed.
        </p>
      </div>
      <br>
      <div>
        <label for="githubToken"><strong>GitHub Personal Token</strong></label><br>
        <input style="width: 100%;" type="text" name="githubToken" required />
        <p>
          The only permission required is the "Contents" permission under "Repository permissions". You can create a new token on the <a href="https://github.com/settings/personal-access-tokens/new" target="_blank">create new token</a> page.
        </p>
      </div>
      <br>
      <button type="submit">Open Decap CMS</button>
      <p>If you want to update these settings later you can go back to <a href="/setup">/setup</a>.</p>
      </form>
    </div>
  </body>
  </html>
  `;
}
