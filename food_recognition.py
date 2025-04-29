import os
import sys
import base64
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel
from clarifai_grpc.grpc.api import resources_pb2, service_pb2, service_pb2_grpc
from clarifai_grpc.grpc.api.status import status_code_pb2

def recognize_food_from_image(image_path=None, image_base64=None):
    """
    Recognize food items in an image using Clarifai's food recognition model.
    
    Args:
        image_path (str, optional): Path to the image file
        image_base64 (str, optional): Base64-encoded image string (without prefix)
        
    Returns:
        list: A list of dictionaries containing food names and confidence scores
    """
    # Your PAT (Personal Access Token) from Clarifai
    PAT = os.environ.get('CLARIFAI_API_KEY')
    
    if not PAT:
        print("ERROR: CLARIFAI_API_KEY environment variable not set")
        print("Please set your Clarifai API key with:")
        print("   export CLARIFAI_API_KEY='your_api_key'")
        return None
    
    # Set up the API connection
    channel = ClarifaiChannel.get_grpc_channel()
    stub = service_pb2_grpc.V2Stub(channel)
    metadata = (('authorization', f'Key {PAT}'),)
    
    # Prepare the user app data
    user_app_id = resources_pb2.UserAppIDSet(
        user_id="clarifai",
        app_id="main"
    )
    
    # Prepare the image data
    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as f:
            file_bytes = f.read()
        image_data = resources_pb2.Image(base64=file_bytes)
    elif image_base64:
        # Remove data:image/jpeg;base64, prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64 to bytes
        file_bytes = base64.b64decode(image_base64)
        image_data = resources_pb2.Image(base64=file_bytes)
    else:
        print("ERROR: Either image_path or image_base64 must be provided")
        return None
    
    # Create the request for the Food Recognition model
    # Using food-item-recognition model
    request = service_pb2.PostModelOutputsRequest(
        user_app_id=user_app_id,
        model_id="food-item-recognition",
        inputs=[
            resources_pb2.Input(
                data=resources_pb2.Data(
                    image=image_data
                )
            )
        ]
    )
    
    try:
        # Make the API call
        response = stub.PostModelOutputs(request, metadata=metadata)
        
        # Check for errors
        if response.status.code != status_code_pb2.SUCCESS:
            print(f"Error from Clarifai API: {response.status.description}")
            print(f"Details: {response.status.details}")
            return None
        
        # Process the results
        results = []
        for concept in response.outputs[0].data.concepts:
            # Only include items with confidence above 50%
            if concept.value > 0.5:
                results.append({
                    'name': concept.name,
                    'confidence': round(concept.value * 100, 1)  # Convert to percentage
                })
        
        return results
        
    except Exception as e:
        print(f"Exception while calling Clarifai API: {e}")
        return None

def test_food_recognition():
    """Test function to verify Clarifai API functionality."""
    # Check if an image file was provided as a command-line argument
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if not os.path.exists(image_path):
            print(f"Error: Image file '{image_path}' does not exist.")
            return
            
        print(f"Testing food recognition with image: {image_path}")
        results = recognize_food_from_image(image_path=image_path)
    else:
        print("No image provided. Please provide an image path as a command-line argument.")
        print("Usage: python food_recognition.py <image_path>")
        return
    
    if results:
        print("\nRecognized Foods:")
        print("----------------")
        for idx, food in enumerate(results, 1):
            print(f"{idx}. {food['name']} ({food['confidence']}% confidence)")
    else:
        print("No foods were recognized in the image or an error occurred.")

if __name__ == "__main__":
    test_food_recognition() 