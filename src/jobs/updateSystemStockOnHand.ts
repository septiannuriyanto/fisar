
export async function updateSystemStockOnHand(){
    // Implement the logic to update system stock on hand here
    console.log("Updating system stock on hand...");
    // Example: Call your database or API to update stock
    // await database.updateStockOnHand();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
    console.log("System stock on hand updated.");
    
}