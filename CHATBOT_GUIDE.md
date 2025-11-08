# AI Chatbot for Graph Manipulation - User Guide

## Overview

The AI chatbot allows you to manipulate your travel itinerary graph using natural language commands. Simply open the chat widget and describe what you want to do with your trip!

## Features

- **Add Locations**: Add new stops and destinations to your itinerary
- **Remove Locations**: Remove unwanted stops from your trip
- **Connect Places**: Create connections between locations with travel details
- **Modify Routes**: Update existing locations and connections
- **Undo/Redo**: Revert or restore changes made by the chatbot
- **Conversation Memory**: The chatbot remembers your conversation for contextual responses

## How to Use

1. **Open the Chat**: Click the chat bubble icon in the bottom-right corner
2. **Type Your Query**: Describe what you want to do in natural language
3. **Review Changes**: The chatbot will update your graph and provide a confirmation message
4. **Undo if Needed**: Use the undo/redo buttons in the chat header to revert changes

## Example Queries

### Adding Locations
- "Add a stop in Milan between Paris and Rome"
- "Add Venice as day 4 of the trip"
- "Include a visit to the Eiffel Tower on day 2"
- "Add a hotel stay in Barcelona"

### Removing Locations
- "Remove the stop in Lyon"
- "Delete the Venice node"
- "Remove day 3 from the itinerary"

### Connecting Places
- "Connect London to Paris with a 3-hour train ride"
- "Add a flight connection from Rome to Barcelona"
- "Link the Louvre Museum to the Eiffel Tower"

### Modifying Existing Nodes
- "Change the label of node 3 to 'Colosseum Tour'"
- "Update Paris to be on day 2 instead of day 1"
- "Rename the first stop to 'Charles de Gaulle Airport'"

### Asking Questions
- "What attractions are in Paris?"
- "What should I do in Barcelona?"
- "Tell me about the best route from London to Rome"

## Tips for Better Results

1. **Be Specific**: Include details like day numbers, location names, or connection types
2. **Reference Existing Locations**: Use the names of existing nodes in your graph
3. **One Request at a Time**: For complex changes, break them into multiple queries
4. **Use Natural Language**: You don't need to use technical terms - just describe what you want

## Command Types (Behind the Scenes)

The chatbot understands several types of commands:

- `add_node`: Creates a new location/stop
- `remove_node`: Deletes a location from the itinerary
- `add_edge`: Creates a connection between two locations
- `remove_edge`: Removes a connection
- `update_node`: Modifies an existing location's properties
- `update_edge`: Changes connection details

## Undo/Redo

- **Undo Button** (↶): Reverts the last change made by the chatbot
- **Redo Button** (↷): Restores a change that was undone
- History is maintained throughout your session

## Technical Details

### API Endpoint
- **Route**: `/api/chatbot/graph-command`
- **Method**: POST
- **Payload**: Query, current nodes, edges, conversation history

### Graph Command Execution
The chatbot uses OpenAI's GPT-4o-mini to convert natural language queries into structured graph commands, which are then executed on the ReactFlow canvas.

### Data Format
- **Nodes**: Each location is a node with ID, label, day, info, and Google Maps link
- **Edges**: Connections between nodes with optional labels (e.g., "3h drive")

## Troubleshooting

**Chatbot doesn't respond:**
- Check your internet connection
- Verify that OPENAI_API_KEY is set in your environment variables

**Wrong location added:**
- Be more specific in your query
- Use undo to revert and try again with clearer instructions

**Can't find a location to modify:**
- Reference the location by its exact name from the graph
- Check the current nodes list in your itinerary

## Future Enhancements

- Visual feedback highlighting modified nodes
- Multi-step operations in a single query
- Smart suggestions based on your itinerary
- Integration with real-time travel data
