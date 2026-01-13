
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from("user_reviews")
        .select("id, reviewer:reviewer_id ( id, display_name )")
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data:", JSON.stringify(data, null, 2));
        if (data.length > 0) {
            console.log("Type of reviewer:", typeof data[0].reviewer);
            console.log("Is Array?", Array.isArray(data[0].reviewer));
        }
    }
}

test();
