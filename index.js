import { parse } from "yaml";

function renderBody(status, content) {
  const html = `
  <script>
    const receiveMessage = (message) => {
      window.opener.postMessage(
        'authorization:github:${status}:${JSON.stringify(content)}',
        message.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  </script>
  `;
  const blob = new Blob([html]);
  return blob;
}

export default {
  async fetch(request, env) {
    const decapConfigUrl = env.DECAP_CONFIG_URL;
    const githubToken = env.GITHUB_TOKEN;

    const url = new URL(request.url);
    if (url.pathname === "/auth") {
      const provider = "github";
      const responseBody = renderBody("success", {
        token: githubToken,
        provider,
      });
      return new Response(responseBody, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
        status: 200,
      });
    }

    const response = await fetch(decapConfigUrl);
    const ymlText = await response.text();
    const decapJsonConfig = parse(ymlText);

    if (!decapJsonConfig.backend) {
      decapJsonConfig.backend = {};
    }

    decapJsonConfig.backend.name = "github";
    decapJsonConfig.backend.auth_endpoint = "/auth";

    const html = /*html*/ `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex" />
        <title>Content Manager</title>
    </head>
    <body>
      <script>window.CMS_MANUAL_INIT = true</script>
      <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
      <script type="module">
        const { CMS, initCMS } = window
        initCMS({
            config: ${JSON.stringify(decapJsonConfig)},
        })
      </script>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
};
