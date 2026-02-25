import React from "react";

class PuzzleGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageFile: null,       // the raw File object from the input
            imageUrl: null,        // a browser-created URL for previewing <img src="...">
            imageDataUrl: null,    // base64 Data URL (optional, from FileReader)
            imageBitmapInfo: null, // { width, height } (optional)
            error: null,
            puzzle_size: 1
        };

        // Bind event handlers so `this` works inside them
        this.handleFileChange = this.handleFileChange.bind(this);
        this.clearImage = this.clearImage.bind(this);
        this.handlePuzzleSizeChange = this.handlePuzzleSizeChange.bind(this);
    }

    componentWillUnmount() {
        // Clean up any object URL when the component leaves the page
        if (this.state.imageUrl) {
            URL.revokeObjectURL(this.state.imageUrl);
        }
    }

    async handleFileChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // Basic validation: ensure it's an image
        if (!file.type.startsWith("image/")) {
            this.setState({ error: "Please choose an image file.", imageFile: null });
            e.target.value = "";
            return;
        }

        // Optional size check (example: 10MB)
        const MAX_MB = 10;
        if (file.size > MAX_MB * 1024 * 1024) {
            this.setState({ error: `Image must be under ${MAX_MB}MB.`, imageFile: null });
            e.target.value = "";
            return;
        }

        // If we already had an object URL, revoke it to avoid memory leaks
        if (this.state.imageUrl) {
            URL.revokeObjectURL(this.state.imageUrl);
        }

        // Create a preview URL (fast + doesn't read whole file into JS memory)
        const objectUrl = URL.createObjectURL(file);

        // Store the File + preview URL immediately
        this.setState({
            imageFile: file,
            imageUrl: objectUrl,
            error: null,
            imageDataUrl: null,
            imageBitmapInfo: null,
        });

        // OPTION A: Read the entire file as a base64 "data URL"
        // Useful if you want to store/transmit the image as a string,
        // but it's bigger than the original and uses more memory.
        const dataUrl = await this.readFileAsDataURL(file);

        // OPTION B: Get image dimensions (width/height) by loading it
        const info = await this.getImageSizeFromDataUrl(dataUrl);

        this.setState({
            imageDataUrl: dataUrl,
            imageBitmapInfo: info,
        });

        // At this point you have:
        // - this.state.imageFile (raw file)
        // - this.state.imageUrl (preview)
        // - this.state.imageDataUrl (base64 string)
        // - this.state.imageBitmapInfo (width/height)
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);  // reader.result is the data URL string
            reader.onerror = () => reject(reader.error);

            reader.readAsDataURL(file);
        });
    }

    getImageSizeFromDataUrl(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    clearImage() {
        if (this.state.imageUrl) {
            URL.revokeObjectURL(this.state.imageUrl);
        }

        this.setState({
            imageFile: null,
            imageUrl: null,
            imageDataUrl: null,
            imageBitmapInfo: null,
            error: null,
        });
    }

    handlePuzzleSizeChange(e) {
        this.setState({
            puzzleSize: 10
        })
    }

    render() {
        const { imageUrl, imageFile, imageBitmapInfo, error } = this.state;

        return (
            <div id="puzzle-game">
                <h1>The Puzzle Game</h1>
                <p>
                In this game, you can import a picture, then define how you would like the puzzle to be
                separated. When you hit start game, it will give you all of the puzzle pieces of your
                picture for you to put back together. There is a timer so you can keep track of your
                high score.
                </p>

                <div style={{display: "flex", gap: "24px", padding: "24px", margin: "0 auto" }}>
                    <div id="settings-area" style={{ flex: 1, padding: "16px" }}>
                        <div id="upload-picture" style={{ display: "grid", gap: 10, maxWidth: 480 }}>
                            <label>
                                Upload an image: 
                                <input type="file" accept="image/*" onChange={this.handleFileChange} />
                            </label>
                        </div>

                        <div id="choose-size">
                            <label>
                                Choose Puzzle Size: 
                                <input type="text" onChange={this.handlePuzzleSizeChange} />
                            </label>
                        </div>
                    </div>
                    <div id="game-area" style={{ flex: 2, padding: "16px" }}>
                        {error && <div style={{ color: "crimson" }}>{error}</div>}

                        {imageUrl && (
                            <div style={{ display: "grid", gap: 8 }}>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    style={{ width: "100%", borderRadius: 12, objectFit: "cover" }}
                                />

                                <div style={{ fontSize: 12, opacity: 0.85 }}>
                                    {imageFile && (
                                        <>
                                            <div><b>File:</b> {imageFile.name}</div>
                                            <div><b>Type:</b> {imageFile.type}</div>
                                            <div><b>Size:</b> {Math.round(imageFile.size / 1024)} KB</div>
                                        </>
                                    )}
                                    {imageBitmapInfo && (
                                        <div><b>Dimensions:</b> {imageBitmapInfo.width} × {imageBitmapInfo.height}</div>
                                    )}
                                </div>

                                <button type="button" onClick={this.clearImage}>
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default PuzzleGame;


// TODO:
// Make image much smaller and show up on right side of settings
// Get puzzle size input working smoother (no automatic changes unless user confirms)
// Possibly rearrange into multiple classes/components
// Work on actual puzzle game