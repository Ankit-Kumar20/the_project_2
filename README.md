Welcome to the NextJS base template bootstrapped using the `create-next-app`. This template supports TypeScript, but you can use normal JavaScript as well.

## 🚀 Features

- **AI-Powered Travel Planning**: Generate detailed travel itineraries with ReactFlow diagrams
- **Real-time Travel Information**: Uses Exa AI to gather up-to-date travel information from the web
- **Smart Recommendations**: LLM analyzes real-time data to suggest actual attractions and activities
- **Google Maps Integration**: Each location includes a clickable link to view on Google Maps
- **Interactive Flow Diagram**: Visual representation of your entire trip with day-by-day breakdown
- **Clean Wireframe UI**: Minimal black & white design with high contrast for clarity

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` and add your API keys:

```bash
EXA_API_KEY=your_exa_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_url_here
BETTER_AUTH_SECRET=your_auth_secret_here
```

**Get your API keys:**
- Exa API: Sign up at [exa.ai](https://exa.ai) 
- OpenAI API: Get from [platform.openai.com](https://platform.openai.com)

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

Hit the run button or use:

```bash
npm run dev
```

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on `/api/hello`. This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## 🧠 How It Works

### Travel Flow Generation Process

1. **User Input**: User clicks "New Trip" button and fills in travel details (From, To, Days, Stops)
2. **Exa Search**: The system searches the web for real-time travel information:
   - Best attractions in destination
   - Travel guides and routes
   - Popular activities
   - Information about intermediate stops
3. **LLM Processing**: OpenAI GPT-4 analyzes the gathered information and generates:
   - Day-by-day itinerary
   - Specific activities and attractions (based on real data)
   - Accommodation suggestions
   - Transportation details
   - Cost estimates
   - Travel tips
   - Google Maps links for each location
   - GPS coordinates for mapping
4. **Flow Diagram**: The generated plan is visualized as an interactive ReactFlow diagram on the canvas with clickable Google Maps links on each node

### Key Files

- `pages/index.tsx` - Home page with modal form for trip planning
- `pages/canvas.tsx` - ReactFlow canvas for displaying travel itineraries
- `pages/api/generate-travel-flow.ts` - API route that integrates Exa + OpenAI to generate travel plans

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Productionizing your Next App

To make your next App run smoothly in production make sure to deploy your project with [Repl Deployments](https://docs.replit.com/hosting/deployments/about-deployments)!

You can also produce a production build by running `npm run build` and [changing the run command](https://docs.replit.com/programming-ide/configuring-repl#run) to `npm run start`.
