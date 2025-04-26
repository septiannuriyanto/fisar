
export async function cekFilterUsedDays(){
    // Implement the logic to update system stock on hand here
    console.log("Checking filter used days...");
    // Example: Call your database or API to update stock
    // await database.updateStockOnHand();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
    console.log("Filter used days checked.");
    
}