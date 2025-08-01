export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { user_input } = await req.json();
    const difyApiKey = process.env.DIFY_API_KEY;
    const difyApiUrl = process.env.DIFY_API_URL;

    if (!difyApiKey || !difyApiUrl) {
      throw new Error("サーバー側の設定が不完全です。");
    }

    const response = await fetch(difyApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "inputs": {
          "user_input": user_input
        },
        "response_mode": "blocking",
        "user": "operator-01"
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify APIからのエラー: ${errorText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ text: data.data.outputs.text }), {
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};
