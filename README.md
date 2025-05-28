# Decap CMS as Lumo app

This is a custom version Decap CMS that can run as a Lumobase app. Use it to edit website content in a Github repository without having to setup Decap CMS yourself - just add a decapconfig.yml file.

Limitations
- Website content need to be in a Github repository (Gitlab etc not supported)

## How to use

1. Login to Lumobase at [lumoapps.me](https://lumoapps.me)
2. Install the app [Install Lumo Decap](https://lumoapps.me/dash?appUrl=https%3A%2F%2Fgithub.com%2Fsimonbengtsson%2Flumo-decap%2Freleases%2Flatest%2Fdownload%2Fapp.lumo)
3. Open the Lumo Decap app and follow the setup instructions (you need to add a Github personal api token and pick a Github repsitory with the website content you want to edit and a decapconfig.yml file)

## Example website (vitepress)

You can use any [static site generator that Decap CMS supports](https://decapcms.org/docs/gatsby/#:~:text=Variable%20Type%20Widgets-,Platform%20Guides,-Gatsby) and here is an example how to setup a site with Vitepress: https://github.com/simonbengtsson/lumo-decap-vitepress.

## Development

You can run the app locally with `npm run dev` and create a new lumo app file with `npm run build:lumo`.
