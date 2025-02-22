import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
import skl2onnx
from skl2onnx.common.data_types import FloatTensorType

# Sample data
texts = [
    "This is great",
    "I love it",
    "Amazing product",
    "This is terrible",
    "I hate it",
    "Poor quality"
]
labels = np.array([1, 1, 1, 0, 0, 0])  # 1 for positive, 0 for negative

# Create pipeline
pipeline = Pipeline([
    ('vectorizer', CountVectorizer(max_features=100)),
    ('classifier', LogisticRegression())
])

# Train pipeline
pipeline.fit(texts, labels)

# Get feature names for the vectorizer
feature_names = pipeline.named_steps['vectorizer'].get_feature_names_out()
n_features = len(feature_names)

# Convert to ONNX
initial_type = [('float_input', FloatTensorType([None, n_features]))]
onx = skl2onnx.convert_sklearn(
    pipeline.named_steps['classifier'], 
    'text_classifier',
    initial_types=initial_type,
    options={type(pipeline.named_steps['classifier']): {'zipmap': False}}
)

# Save model and metadata
import os
os.makedirs('models', exist_ok=True)

# Save model
with open("models/text-classifier.onnx", "wb") as f:
    f.write(onx.SerializeToString())

# Save feature names
with open("models/feature_names.txt", "w") as f:
    f.write("\n".join(feature_names))

print("Model and features saved to models/")
print(f"Number of features: {n_features}")
