#!/usr/bin/env bash
# Creates per-member commit aliases: git commit-aryan, commit-rishi, commit-chetan, commit-shanteshwar
set -e
git config alias.commit-aryan '!git -c user.name="Aryan Ketkar" -c user.email="aryanketkar02@gmail.com" commit'
git config alias.commit-rishi '!git -c user.name="Rishi Agrawal" -c user.email="rishisagrawal02@gmail.com" commit'
git config alias.commit-chetan '!git -c user.name="Chetan Agrawal" -c user.email="chetanagrawal721@gmail.com" commit'
git config alias.commit-shanteshwar '!git -c user.name="Shanteshwar Malang" -c user.email="malangshanteshwar@gmail.com" commit'
echo "Aliases installed (repo-local)."
