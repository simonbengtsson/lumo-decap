import { parse } from "yaml";

export default {
  async fetch(_, env) {
    const decapConfigUrl = env.DECAP_CONFIG_URL;

    const response = await fetch(decapConfigUrl);
    const ymlText = await response.text();
    const decapJsonConfig = parse(ymlText);

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
