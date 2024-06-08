# Guide to Setup Clipbot locally

## Setting up clipbot-nextjs-main:

Step 1: Clone the project repository.

Command:
```
git clone [URL]
# or
git clone [URL] [folder_name]
```

Step 2: Open your code editor in the code directory and run the following command to install the dependencies:

```
npm i
# or
npm i --force (in case of version conflict)
# or
yarn
# or
yarn install
```

### Setting up Environment Variables:
- Create a dotenv (.env) file in the project's root directory that will be used to store all the environment variables.

### List of environment variables:
- APP_KEY = 
- BASE_URL = Address (URL) to run your project locally.
- JWT_SECRET = Anything for Authorization.
- NEXT_PUBLIC_CROP_VIDEO_URL = Address on which your clipbot-crop-video project is running on.
- NEXT_PUBLIC_CROP_APP_KEY = 
- DATABASE_URL = Your postgresql address of the form - postgresql://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_HOSTNAME]:[YOUR_PORTNUMBER]/[YOUR_DATABASENAME]
- NEXTAUTH_URL = Your Authentication Route based on the project. (In this case: BASE_URL/api/auth)
- NEXTAUTH_SECRET = Anything for Authorization.
- TWITCH_CLIENT_ID = Key retrieved from your Twitch developer settings. [Twitch Dev](https://dev.twitch.tv/)
- TWITCH_CLIENT_SECRET = Key retrieved from your Twitch developer settings. [Twitch Dev](https://dev.twitch.tv/)
- STRIPE_SECRET_KEY = Key retrieved from your Stripe Dashboard in the API Keys section. [Stripe APIs](https://dashboard.stripe.com/test/apikeys)
- STRIPE_WEBHOOK_SECRET = Key retrieved from your Stripe Dashboard in the Webhook section. [Stripe Webhook](https://dashboard.stripe.com/test/webhooks)
- MONTHLY_PRICE_ID = Manually add a product named "MONTHLY PRICE" through the product catalog option from the Stripe dashboard. [Add Product](https://dashboard.stripe.com/test/products?active=true)
- YEARLY_PRICE_ID = Manually add a product name "YEARLY PRICE" through the product catalog option from the Stripe dashboard. [Add Product](https://dashboard.stripe.com/test/products?active=true)
- TIKTOK_CLIENT_KEY = Key retrieved from your Tiktok developer settings.
- TIKTOK_CLIENT_SECRET = Key retrieved from your Tiktok developer settings.
- YOUTUBE_SECRETS = YTv3 Key retrieved from your Google Developer Console settings.
- FB_REDIRECT_URL = Key retrieved from your Facebook developer settings by adding FB as an app.
- FB_APP_SECRET = Key retrieved from your Facebook developer settings by adding FB as an app.
- NEXT_PUBLIC_AMP_KEY = Key retrieved from [Amplitude Website](https://app.amplitude.com/login)
- PROD_EMAIL = 
- PROD_EMAIL_PASS = 
- SENDGRID_API_KEY = 
- NEXT_PUBLIC_BASE_URL = 
- NEXT_PUBLIC_FB_APP_ID = 

### Setting up Postgresql locally:
- Download the latest Postgresql version compatible with your OS. [Postgresql Download](https://www.postgresql.org/download/)
- Reference: Windows - [How to install PostgreSQL in Windows](https://www.youtube.com/watch?v=0n41UTkOBb0), Mac - [How to install PostgreSQL in Mac](https://www.youtube.com/watch?v=PShGF_udSpk)
- Download this [File](https://drive.google.com/file/d/1iAbhQbsolm9YDifdGkZ0OFdSnh3vtvwm/view?usp=sharing)
- Open pgAdmin, turn on the server and navigate to your database inside your server. Right-click on your database name, select query tool from the menu and paste the SQL code from the provided file in your query tool, and run the query.

### Setting up Twitch API for our Local App:
- Open [Twitch Developer Site](https://dev.twitch.tv/)
- Login into your Twitch Account and navigate to your console.
- After opening your console, click on the applications tab from the side menu.
- Click on register your application.
- Give a name according to your liking, add "http://[BASE_URL]/api/auth/callback/twitch" in OAuth Redirect URLs, and select website integration in the category.
- Copy and paste the Client ID and Client Secret in the env file.

### Setting up Facebook API for our Local App:
- Open [Facebook Developer Site](https://developers.facebook.com/)
- Login into your Facebook Account and navigate to the "My Apps" option on the navbar.
- After opening "My Apps", click the "Create App" option.
- Select the "Authenticate and request data from users with Facebook Login" option and click Next.
- Select "No, I'm not building a game" and go to the next page.
- Give an app name to your liking, and click the "Create App" option.
- You will be navigated to the dashboard of your app. From the side menu, Click on review, then testing, and then click on "Open Graph API Explorer".
- You will get your "User Access Token", "App Token", and "Page Access Token" for the env file.

### Setting up YouTube API for our Local App:
- Open [Google Developer Site](https://console.cloud.google.com/)
- Login into your Google Account and create a project with a name to your liking.
- Click on the 3 bars on the left side menu, select "APIs and services" and go to "Enabled APIs and services".
- Click on "Enable APIs and Services", find Youtube Data API v3, and click enable.
- You will be redirected to the "YouTube Data API v3" page. Navigate to the "Credentials" Tab, click "Create Credentials" and select OAuth Client ID.
- You will get a screen with the option "Configure Consent Screen". Select it.
- Only Google Workspace users have access to the Internal user type, So, select the External option and click on Create.
- Fill in the required fields and click on "Save and Continue".
- Add test users (test user's email address) for allowing YT Authentication, Click on Save and Continue and go back to the dashboard on the credentials screen.
- Again click on Create credentials and select OAuth Client ID.
- Select the application type as Web application, give a name, add HTTP://[BASE_URL]/clips/upload in the Authorized redirect URIs, and click on Create.
- A Popup appears with download JSON as an option. Click and download the JSON file.
- You will get a JSON file with multiple entries. Save only this much: {"web":{"client_id":"YOUR_ID","client_secret":"YOUR_SECRETID","redirect_uris":["YOUR_URI"]}}
- You will get your Youtube OAuth Access Key. Use in your env file.

### Setting up Stripe API for our Local App:
- Open [Stripe Dashboard](https://dashboard.stripe.com)
- Login into your Stripe Account, go to the "Developers" option from the navbar, and navigate to API Keys for your Stripe secret key.
- Similarly, navigate to Webhooks, click on "Add endpoints", and Select "Test in a local environment".
- On the Stripe Code editor, you will find a constant declared as "endpointSecret" which contains your Webhook Key. Use it in your env file.
- Go to the "Product catalog" option from the left side menu and click "Add product".
- Give "Monthly Price" as the name, set recurring, set the price as $15.00, set the billing period as monthly, and click on "Add product". Click on your "Monthly Price" Product and copy the API ID for the "MONTHLY_PRICE_ID" variable in the env file.
- Give "Yearly Price" as the name, set recurring, set the price as $9.00, set the billing period as yearly, and click on "Add product". Click on your "Yearly Price" Product and copy the API ID for the "YEARLY_PRICE_ID" variable in the env file.

### Setting up Amplitude API for our Local App:
- Open [Amplitude Website](https://app.amplitude.com/login)
- Login and on the Setup amplitude page, scroll down where you will find your API Key.
- Copy your API key and paste it into your env file.

> After completing the above process.

Step 3: Run the development server from the code editor:

```
npm run dev
# or
yarn dev
```

You will get the following message and can navigate to the homepage by going to the URL:

```
started server on 0.0.0.0:3000, url: http://localhost:3000
# OR
url: [BASE_URL]
```

- Refer the README to set up clipbot-crop-video too!

### YOU ARE GOOD TO GO !!

## Setting up dotenv-vault for managing multiple Environments:

- Install dotenv-vault

```
npm i dotenv-vault@latest
# or
yarn add dotenv-vault
```

Step 1: Create a Dotenv Vault Project - After creating a dotenv-vault project in your organization, you will receive a unique Vault ID. Use the following command to create a new vault:

```
npx dotenv-vault@latest new vlt_{YOUR_VAULT_ID}
```

Step 2: Login and Create a .env.me File - Run the login command to create a .env.me file. This step ensures that you are authenticated and ready to manage environment variables.

```
npx dotenv-vault@latest login
```

Additional Step: Check Logged In User - To see the user currently logged in and making changes to the environment files, use:

```
npx dotenv-vault whoami
```

Step 3: Push Changes to the Environment Vault - Push your changes to the desired environment using the appropriate command:

Push to the development environment:
```
npx dotenv-vault push development
# or
npx dotenv-vault push
```
Push to the CI environment: You need a .env.ci file in your directory with #ci in the first line of the .env.ci file.
```
npx dotenv-vault push ci
```
Push to the staging environment: You need a .env.staging file in your directory with #staging in the first line of the .env.staging file.
```
npx dotenv-vault push staging
```
Push to the production environment: You need a .env.production file in your directory with #production in the first line of the .env.production file.
```
npx dotenv-vault push production
```

Additional Step: Pull Changes from the Environment Vault - Pull the latest changes from the desired environment using the appropriate command:

Pull from the development environment:
```
npx dotenv-vault pull development
# or
npx dotenv-vault pull
```
Pull from the CI environment:
```
npx dotenv-vault pull ci
```
Pull from the staging environment:
```
npx dotenv-vault pull staging
```
Pull from the production environment:
```
npx dotenv-vault pull production
```

- [Additional dotenv-vault Information](https://github.com/dotenv-org/dotenv-vault)

# ARCHITECTURE DIAGRAMS FOR CLIPBOT:

## ER-diagram:
![ER-diagram-clipbot-project](https://github.com/Shopvana/clipbot-nextjs/assets/129294554/3a9d3830-a087-44ce-80a4-308746e3637b)
## Mind-Map:
![mind-map-clipbot-project](https://github.com/Shopvana/clipbot-nextjs/assets/129294554/809e7558-2672-490b-8e15-08ecf1b34c86)
## State-chart-diagram:
![state-chart-clipbot-project](https://github.com/Shopvana/clipbot-nextjs/assets/129294554/439aee3c-883e-4bad-add6-b0557230effc)
