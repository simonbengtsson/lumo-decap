# Decap CMS as a Lumobase app

This is a custom version Decap CMS that can run as a Lumobase app. Use it to edit website content in a Github repository (Gitlab etc not supported) without having to setup Decap CMS. Just [install this app](https://lumobase.co/dash?appUrl=https%3A%2F%2Fgithub.com%2Fsimonbengtsson%2Flumo-decap%2Freleases%2Flatest%2Fdownload%2Fapp.lumo) and add a decapconfig.yml to your website repo and you are all set.

## How to use

1. Setup your website and add a decapconfig.yml file (here is an [example Vitepress site](https://github.com/simonbengtsson/lumo-decap-vitepress), but it can be any site supported by Decap)
2. Login to Lumobase at [lumobase.co](https://lumobase.co)
3. Install this app on Lumobase [Install Decap CMS](https://lumobase.co/dash?appUrl=https%3A%2F%2Fgithub.com%2Fsimonbengtsson%2Flumo-decap%2Freleases%2Flatest%2Fdownload%2Fapp.lumo)
4. Open the app and follow the setup instructions

## Development

You can run the app locally with `npm run dev` and create a new app file with `npm run build:lumo`.
