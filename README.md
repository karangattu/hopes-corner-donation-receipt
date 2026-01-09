    

    # Hope's Corner Donation Receipt Generator

    A Next.js web application that allows users to generate and download donation receipts for Hope's Corner.

    ## Getting Started

    1. **Install dependencies:**

        ```bash
        npm install
        ```

    2. **Run the development server:**

        ```bash
        npm run dev
        ```

    3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

    ### Configuration

    Add the following entries to your `.env.local` file:

    ```env
    # Azure AD App Registration Credentials
    AZURE_TENANT_ID=your_tenant_id
    AZURE_CLIENT_ID=your_client_id
    AZURE_CLIENT_SECRET=your_client_secret

    # SharePoint Configuration
    SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/yoursite
    SHAREPOINT_EXCEL_FILE_PATH=/Shared Documents/General/Donations.xlsx
    SHAREPOINT_WORKSHEET_NAME=Table1
    ```

    **Note:** `SHAREPOINT_WORKSHEET_NAME` should be the name of the **Table** in your Excel file where data will be appended.
