# Problem

1. `totalProcessingFee`: The purpose is unclear. The `totalProcessingFee` is calculated by summing the organization's fixed processing fee and percentage processing fee, but this variable is not used elsewhere.
2. [Edit Merchant Processing Fee](src/components/EditMerchantProcessingFee.vue):
   - The calculated values for **Merchant Fee** and **Patient Fee** do not match the Figma design. The calculation logic needs further confirmation.
   - The hardcoded text `$0.10` is unclear where it comes from and what its purpose is.
