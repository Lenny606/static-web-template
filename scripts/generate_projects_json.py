import os
import json
import re

def get_project_title(html_file):
    if not os.path.exists(html_file):
        return None
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'<title>(.*?)<\/title>', content, re.IGNORECASE | re.DOTALL)
            if match:
                title = match.group(1).strip()
                if '|' in title:
                    title = title.split('|')[0].strip()
                return title
            return ""
    except Exception as e:
        print(f"Error reading {html_file}: {e}")
        return None

def find_best_html_match(slug, html_files):
    # Direct match
    if f"{slug}.html" in html_files:
        return f"{slug}.html"
    
    # Check if slug is part of an html filename or vice versa
    for html_file in html_files:
        html_slug = html_file.replace('.html', '')
        if html_slug in slug or slug in html_slug:
            return html_file
            
    return None

def generate_projects_json():
    cwd = os.getcwd()
    projects_dir = os.path.join(cwd, 'assets/images/projects-new')
    html_dir = os.path.join(cwd, 'projects')
    projects = []

    if not os.path.exists(projects_dir):
        print(f"Error: {projects_dir} does not exist.")
        return

    html_files = [f for f in os.listdir(html_dir) if f.endswith('.html')]

    folders = sorted([f for f in os.listdir(projects_dir) if os.path.isdir(os.path.join(projects_dir, f))])

    for folder in folders:
        match = re.match(r'^(\d{4}-\d{2})-(.*)$', folder)
        if match:
            project_id = match.group(1)
            slug = match.group(2)
        else:
            project_id = ""
            slug = folder

        folder_path = os.path.join(projects_dir, folder)
        
        best_html = find_best_html_match(slug, html_files)
        title = None
        if best_html:
            title = get_project_title(os.path.join(html_dir, best_html))
        
        if not title:
            title = slug.replace('-', ' ').title()

        images = set()
        for f in os.listdir(folder_path):
            if f.endswith(('.avif', '.webp', '.jpg', '.png', '.jpeg')):
                base_name = re.sub(r'-\d+w\.(avif|webp|jpg|png|jpeg)$', '', f)
                base_name = re.sub(r'\.(avif|webp|jpg|png|jpeg)$', '', base_name)
                images.add(base_name)
        
        sorted_images = sorted(list(images))

        projects.append({
            "id": project_id,
            "slug": slug,
            "title": title,
            "folder": folder,
            "images": sorted_images
        })

    output_path = os.path.join(projects_dir, 'projects.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)
    
    print(f"Generated {output_path} with {len(projects)} projects.")

if __name__ == "__main__":
    generate_projects_json()
