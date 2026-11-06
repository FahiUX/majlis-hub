#!/usr/bin/env python3
"""
Dump Conversation Script (FahiUX Multi-Agent System)
Parses the current session transcript and compiles a clean, human-readable
chronological conversation log into conversation.md.
"""

import os
import glob
import json
import re
import sys

def find_latest_transcript():
    # Check Antigravity / Gemini CLI transcript logs
    base_dir = os.path.expanduser("~/.gemini/antigravity-cli/brain")
    patterns = [
        os.path.join(base_dir, "*", ".system_generated", "logs", "transcript.jsonl"),
    ]
    candidates = []
    for pattern in patterns:
        candidates.extend(glob.glob(pattern))
    
    if not candidates:
        return None
    # Sort by modification time descending
    candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    return candidates[0]

def dump_conversation(transcript_path, output_path="conversation.md"):
    if not transcript_path or not os.path.exists(transcript_path):
        print(f"Error: Transcript file not found at {transcript_path}")
        sys.exit(1)

    entries = []
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
            except Exception:
                continue

            source = data.get("source")
            step_type = data.get("type")
            created_at = data.get("created_at", "")
            content = data.get("content")

            if source == "USER_EXPLICIT" or step_type == "USER_INPUT":
                if not content:
                    continue
                if "<USER_REQUEST>" in content:
                    match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
                    if match:
                        content = match.group(1).strip()
                content = re.sub(r"<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>", "", content, flags=re.DOTALL).strip()
                if content:
                    entries.append({"role": "USER", "time": created_at, "content": content})

            elif source == "MODEL" and step_type == "PLANNER_RESPONSE" and content:
                text = content.strip()
                if text:
                    entries.append({"role": "ASSISTANT", "time": created_at, "content": text})

    with open(output_path, "w", encoding="utf-8") as out:
        out.write("# 📜 Project Conversation Transcript\n")
        out.write(f"Source Transcript: `{transcript_path}`\n\n")
        out.write("---\n\n")

        user_turn = 1
        for entry in entries:
            role = entry["role"]
            time_str = entry["time"]
            content = entry["content"]

            if role == "USER":
                out.write(f"### 👤 User `[{time_str}]` (Turn {user_turn})\n\n")
                out.write(content + "\n\n")
                user_turn += 1
            else:
                out.write(f"### 🤖 Assistant `[{time_str}]`\n\n")
                out.write(content + "\n\n")
            out.write("---\n\n")

    print(f"✅ Successfully compiled {len(entries)} turns into {output_path}")

if __name__ == "__main__":
    t_path = sys.argv[1] if len(sys.argv) > 1 else find_latest_transcript()
    out_file = sys.argv[2] if len(sys.argv) > 2 else "conversation.md"
    dump_conversation(t_path, out_file)
