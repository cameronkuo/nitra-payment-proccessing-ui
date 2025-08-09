# Nitra Payment Processing UI Requirements

## Objective

This project involves building a **payment processing UI** that allows users to make payments using cash or card. The system should support different locations with tax adjustments, allow users to configure **merchant and patient processing fees**, and provide a smooth checkout experience.

## UI Design

- Figma link:
  https://www.figma.com/design/PEBuPUxukUlKiDVK6oLbjY/Nitra-FE-Assessment
- You can access the design details after logging into Figma.

## Tech Stack

- Vue 3.3 (Quasar Framework v2.12.4 recommended)
- FontAwesome for icons (You can use the solid style or the regular style instead)
- Nice to have: i18n support (English only for now)

## Functional Requirements

- Currency: USD
- Location-based
  - Users can switch between different locations.
  - The payment tax rate should update accordingly based on the selected location.
  - The reader options should update accordingly based on the selected location.
- Payment Methods
  - Cash Payment
    - No processing fee will be applied.
  - Card Payment
    - In the “**Edit Merchant Processing Fee**” dialog, the total processing fee is calculated as: totalProcessingFee = totalProcessingFeeFixed + (totalProcessingFeePercentage \* payment amount)
    - The **merchant and patient** share the processing fee. Users can configure the fixed and percentage-based fees for each party in the dialog.
    - The total processing fee should dynamically update based on the entered payment amount.
    - Users can choose a **non-offline payment reader** to process the payment.
    - Patients can manually enter their card details for payment processing.
