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
- Refer the .env.example file in the code repo for all the environment variables.

### List of Services:
- JSON Web Token (JWT): Used for secure token verification, typically for user authentication and authorization.
- Crop Video Microservice: Utilized for video cropping functionalities within the application, ensuring efficient media processing.
- Postgres Database: Stores user data securely, providing a reliable and scalable solution for data management.
- NextAuth: Employs Next.js for seamless authentication processes, enhancing user experience and security.
- Twitch OAuth: Enables integration with Twitch for user authentication and access to Twitch APIs and services.
- Stripe: Facilitates payment processing and subscription management, ensuring secure transactions within the application.
- TikTok OAuth: Allows integration with TikTok for user authentication and access to TikTok APIs and services.
- YouTube OAuth: Permits integration with YouTube for user authentication and access to YouTube APIs and services.
- Amplitude: Tracks user behavior and engagement within the application, providing valuable insights for analytics and optimization.
- SendGrid: Sends transactional and marketing emails, ensuring reliable email delivery and communication with users.
- Facebook OAuth: Integrates with Facebook for user authentication and access to Facebook APIs and services.
- Replicate API: Utilized for transcription services, enabling the application to transcribe audio and video content efficiently.

### Setting up Postgresql locally:

- Download the latest Postgresql version compatible with your OS. [Postgresql Download](https://www.postgresql.org/download/)
- Reference: Windows - [How to install PostgreSQL in Windows](https://www.youtube.com/watch?v=0n41UTkOBb0), Mac - [How to install PostgreSQL in Mac](https://www.youtube.com/watch?v=PShGF_udSpk)
- Download this [File](https://drive.google.com/file/d/1iAbhQbsolm9YDifdGkZ0OFdSnh3vtvwm/view?usp=sharing)
- Open pgAdmin, turn on the server and navigate to your database inside your server. Right-click on your database name, select query tool from the menu and paste the SQL code from the provided file in your query tool, and run the query.

Alternate Option for Postgres (Setting up on railway):
- Got to [Railway](https://railway.app/). Login and go your dashboard from the top right.
- Click on "New Project". Select "Deploy PostgreSQL" from the dropdown menu. It will create a postgresDB and deploy automatically. If it doesn't automatically deploy, you will see a button to deploy near your postgresDB. Click on it.
- After deployment is complete, go to the "Data" Tab on your postgresDB and click on connect. You will see three options: Copy connection URL, Raw psql command, and Railway CLI connect command. Copy the connection url something like "postgresql://" and paste it the DATABASE_URL variable in your env file.
- Now from your code editor terminal, run the following command:
```
prisma db push
```
and then:
```
prisma migrate dev
```
- This will generate tables in your railway postgresDB and you will be able to see them in the "Data" Tab.

### Setting up Twitch API for our Local App:
- Open [Twitch Developer Site](https://dev.twitch.tv/)
- Login into your Twitch Account and navigate to your console.
- After opening your console, click on the applications tab from the side menu.
- Click on register your application.
- Give a "Name" according to your liking, then initially add "http://[BASE_URL]/api/auth/callback/twitch" in "OAuth Redirect URLs", select "Website Integration" in the "Category" dropdown, select "Client Type" as "Confidential", and click on "Create".
- Copy and paste the Client ID and Client Secret in the env file.

### Setting up Facebook API for our Local App:
- Open [Facebook Developer Site](https://developers.facebook.com/)
- Login into your Facebook Account and navigate to the "My Apps" option on the navbar.
- After opening "My Apps", click the "Create App" option.
- Select the "Authenticate and request data from users with Facebook Login" option and click Next.
- Select "No, I'm not building a game" and go to the next page.
- Give an app name to your liking, and click the "Create App" option.
- You will be navigated to the dashboard of your app. From the side menu, Click on "App Settings", then select "Basic".
- You will see your "App ID", and "App secret". Copy and paste "App ID' in the NEXT_PUBLIC_FB_APP_ID variable and the "App secret" in the FB_APP_SECRET variable in the env file.

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

### Setting up TikTok API for our Local App:
- Go to the [Tiktok developer's page](https://developers.tiktok.com/).
- Log into your account and if you don't have one, create a new Account on the tiktok developers site.
- After navigating into your account, hover on your icon at the top-right. You will see an option "Manage apps". Click on it.
- On the Manage apps page, click on "Connect an app".
- A dialog-box opens up. Choose "An individual developer (myself)" under the "Select the app owner" option, enter a name for the app that will be displayed, and click on "Create".
- You will see "Client key" and "Client secret". Copy and paste "Client key" in the TIKTOK_CLIENT_KEY variable and the "Client secret" in the TIKTOK_CLIENT_SECRET variable in the env file.

### Setting up Stripe API for our Local App:
- Open [Stripe Dashboard](https://dashboard.stripe.com)
- Login into your Stripe Account, go to the "Developers" option from the navbar, and navigate to API Keys for your Stripe secret key. Infront of "Secret key", click on "Reveal test key". Copy and paste the secret key in the STRIPE_SECRET_KEY variable in the env file.
- Go to the "Product catalog" option from the left side menu and click "Add product".
- Give "Clipbot_test" or any other relevant name, set recurring, set the price as $15.00, set the billing period as monthly, and click on "Add product". Open the product from the "Product catalog" page that you have created. On the right sidebar under details, you will see your Product ID something like "prod_". Copy and paste in the "STRIPE_PRODUCT_ID" variable in the env file.
- Adjacent to "Pricing", you will see a "+" icon. Click on "+", set recurring, set "Choose your pricing model" as "Flat rate", set the price as $9.00, set the billing period as yearly, and click on "Create price". Now you will have two prices under "Pricing".
- Click of your "$9.00" price, a new interface pops up. On the top-right you will see your price ID something like "price_". Copy the price ID for the "MONTHLY_PRICE_ID" variable in the env file.
- Similarly, click on your "$15.00" price and copy the price id from the top right and set the "YEARLY_PRICE_ID" variable in the env file.

Setting up Stripe webhook locally:
- run the command on your terminal.
```
stripe login
```
You will have message a message with a pairing code and a link to open on your browser to complete the login process for stripe. Enter your stripe email and password. You will get a screen asking to allow Stripe CLI to access your account information. Check the Account showing just below the message and the stripe cli login command string which should match with the pairing code. If they are correct, click on "Allow Access".
- now run the following command on the terminal:
```
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```
- You will have your stripe development running on the terminal to process payments.
- Stripe development server generates a signing secret and you will have a message in the terminal like "Ready! You are using Stripe API Version [2024-04-10]. Your webhook signing secret is whsec_YOUR SECRET".
- Copy this webhook secret and paste in "STRIPE_WEBHOOK_SECRET" variable in the env file.

Setting up Stripe webhook for deployed links:
- Navigate to the developers tab on the Navbar again.
- Go to the webhooks section.
- Add a new endpoint with the endpoint URL as "https://[BASE_URL]/api/stripe/webhook". In my case, "https://app-dev.clipbot.tv/api/stripe/webhook" and select the following events:
  - invoice.payment_failed
  - customer.subscription.updated
  - customer.subscription.created
  - customer.card.updated
  - customer.bank_account.updated
  - customer.subscription.deleted
- After creating the webhook successfully, copy the signing secret after clicking on reveal and update the env variable on railway.

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
