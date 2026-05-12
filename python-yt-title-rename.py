import os
import json
import re
from moviepy import VideoFileClip

def format_timestamp(seconds):
    """Converts seconds into YouTube-friendly HH:MM:SS or MM:SS format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes:02d}:{secs:02d}"

def sanitize_filename(filename):
    """Removes invalid OS/shell characters to prevent renaming errors."""
    return re.sub(r'[\\/*?:"<>|]', "-", filename)

def process_youtube_videos(folder_path):
    valid_extensions = ('.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv')
    
    # 1. Find the exported JSON file
    json_files = [f for f in os.listdir(folder_path) if f.endswith('.json') and 'G4Gate_YT_Export' in f]
    if not json_files:
        print("❌ No 'G4Gate_YT_Export.json' file found in this directory.")
        print("Please click 'Export YT Data' in your Next.js app and place the JSON file here.")
        return
    
    json_path = os.path.join(folder_path, json_files[0])
    with open(json_path, 'r', encoding='utf-8') as f:
        yt_data = json.load(f)

    # 2. Fetch and sort video files by modification date (oldest first = order of recording)
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(valid_extensions)]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(folder_path, x)))

    if not files:
        print("❌ No video files found in the current folder.")
        return

    # 3. Check for mismatches between recorded videos and exported questions
    num_videos = len(files)
    num_questions = len(yt_data)
    
    if num_videos != num_questions:
        print(f"\n⚠️ WARNING: MISMATCH DETECTED!")
        print(f"There are {num_videos} videos in the folder, but {num_questions} questions in the JSON export.")
        proceed = input("Do you want to proceed anyway? This might assign the wrong titles to videos. (y/n): ")
        if proceed.lower() != 'y':
            print("Operation aborted. Please check your folder and recordings.")
            return

    output_filename = os.path.join(folder_path, "G4Gate_timestamps.txt")
    current_time_seconds = 0

    print("\n🚀 Starting G4Gate Video Processing Pipeline...\n")

    with open(output_filename, 'w', encoding='utf-8') as txt_file:
        # 4. Pair each sorted video with its corresponding extracted data
        for index, (filename, q_data) in enumerate(zip(files, yt_data), start=1):
            timestamp = format_timestamp(current_time_seconds)
            
            # Extract extension and create a clean, OS-safe filename
            ext = os.path.splitext(filename)[1]
            safe_video_title = sanitize_filename(q_data['video_title'])
            new_filename = f"{safe_video_title}{ext}"
            
            old_filepath = os.path.join(folder_path, filename)
            new_filepath = os.path.join(folder_path, new_filename)

            # Rename the video file
            try:
                os.rename(old_filepath, new_filepath)
                print(f"✅ Renamed: '{filename}' -> '{new_filename}'")
            except Exception as e:
                print(f"❌ Error renaming {filename}: {e}")
                # Fallback to old name so the timestamp loop doesn't crash
                new_filepath = old_filepath 
                new_filename = filename

            # Generate the YouTube description string
            line = f"{timestamp} - {q_data['timestamp_title']}"
            print(f"   Timestamp: {line}")
            txt_file.write(line + "\n")

            # Load the video clip to calculate duration for the *next* timestamp
            try:
                clip = VideoFileClip(new_filepath)
                current_time_seconds += clip.duration
                clip.close()  # Critical: Close to free up RAM on large batch runs
            except Exception as e:
                print(f"⚠️ Skipping duration check for {new_filename} due to error: {e}")

    print(f"\n🎉 Done! All videos renamed and timestamps saved to '{output_filename}'.")

if __name__ == "__main__":
    # Runs in the current directory
    target_folder = "." 
    process_youtube_videos(target_folder)