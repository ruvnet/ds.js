import onnx
from onnx import helper
from onnx import TensorProto

# Create a simple model that concatenates input with a fixed string
def create_text_model():
    # Create input (string)
    input = helper.make_tensor_value_info('input', TensorProto.STRING, [1])
    output = helper.make_tensor_value_info('output', TensorProto.STRING, [1])

    # Create a node that concatenates strings
    node = helper.make_node(
        'Concat',
        inputs=['input'],
        outputs=['output'],
        axis=0
    )

    # Create the graph
    graph = helper.make_graph(
        [node],
        'text-generation',
        [input],
        [output]
    )

    # Create the model
    model = helper.make_model(graph)
    
    # Save the model
    onnx.save(model, 'models/text-generation.onnx')

if __name__ == '__main__':
    create_text_model()
