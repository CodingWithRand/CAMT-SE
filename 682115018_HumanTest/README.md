# Implemented Features
1. Image button grid rendering
Loop through the topic set to create the image button according to the data in the topic, with "click" event listeners registered to the button for the tile (image button) selection. ("keydown" event listener is not required for Enter and Space key pressing to work as selection, tested on Chrome, Microsoft Edge, and Brave. Still, I implemented the event listener anyway.)
2. Toggle function for tiles selection
- Implement adding and removing tile's index to the selected set
- Enhance accessibility through ARIA attribute.
- Modify CSS style for noticeable selecting tile.
- Enable "Check" button when at least a tile is selected.
3. Check function
- Check if the selected tiles, stored as indexes in the selected set, are according to the correct set, and label the tiles as correct/wrong for the tiles that are selected or missed for the tile that have not been selected.
- Show the result of the game. (How many correct tiles are selected? How many wrong tiles are selected?)
4. Best Time Played (Stretch Goal)
- Show a running timer during the game, and stop it when the game end.
- After the game, show this round's time that the player take to finished the game, and show the best time they took.
- The timer work REGARDLESS of correctness of tiles selection.