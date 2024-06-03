import os

def print_folder_structure(folder_path, indent=""):
    for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)
        if os.path.isfile(item_path):
            print(f"{indent}- {item}")  # Print file
        elif os.path.isdir(item_path):
            print(f"{indent}+ {item}")  # Print folder
            print_folder_structure(item_path, indent + "  ")  # Recursively print sub-folder

# Specify the root folder you want to print the structure of
root_folder = "/Users/Documents/sar_storytelling/IDEATE-studio/public/assets/sprites"

# Call the function to print the structure
print_folder_structure(root_folder)