# Lumo Decap

This is a custom version Decap CMS adapted to run as a Lumo app (basically a custom Lumo backend). Use it to edit your website content without having to setup autentication for your Decap instance. You don't even have to add Decap CMS to your website (just a decap config file in your Github repository).

Current limitations
- Only Github is supported as a content source
- Github personal access token need to be manually entered (oauth login not supported yet)

## How to use

1. Go to [Lumo Apps](https://lumoapps.me) and login
2. Go to the latest release in this repo and download the `app.lumo` file
3. Upload the app.lumo file and install it on 
4. Open the Lumo Decap app and follow the setup instructions (you need to add a github personal api token and pick a Github repsitory with the content you want to edit)

Since Lumo apps are essentially cloudflare workers you can also publish this to your own cloudflare account (outside of Lumo) by setting up the required bindings in wrangler.jsonc and then deploy with wrangler.

## Example website (vitepress)

You can use any [static site generator that Decap CMS supports](https://decapcms.org/docs/gatsby/#:~:text=Variable%20Type%20Widgets-,Platform%20Guides,-Gatsby) and here is an example using Vitepress: https://github.com/simonbengtsson/lumo-decap-vitepress.

## Development

You can run the app locally with `npm run dev` and create a new lumo app file with `npm run build:lumo`.
