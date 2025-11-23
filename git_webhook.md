# Git Production Deployment Setup

This guide provides step-by-step instructions for setting up automatic deployment to a production server when pushing changes via Git.

## Overview

This setup allows you to deploy the biblioteca PWA to a production server by pushing to a Git remote. The deployment is triggered automatically via a Git post-receive hook.

**Architecture:**
- Local repository → Push to production remote
- Production server receives push → Triggers post-receive hook
- Hook checks out files to web server directory

## Prerequisites

- SSH access to production server (root@173.249.16.84)
- Git installed on production server
- Web server configured (nginx/Apache)

## Part 1: Local Setup (Already Completed)

The production remote has been added to the local repository using the SSH config alias:

```bash
git remote add production contabo:/var/repo/biblioteca.git
```

**Note:** If you have an SSH config alias set up (like `contabo` pointing to `root@173.249.16.84`), use that instead of the full SSH URL for convenience.

Verify remotes:
```bash
git remote -v
```

Expected output:
```
origin      https://github.com/bacanapps/biblioteca.git (fetch)
origin      https://github.com/bacanapps/biblioteca.git (push)
production  root@173.249.16.84:/var/repo/biblioteca.git (fetch)
production  root@173.249.16.84:/var/repo/biblioteca.git (push)
```

## Part 2: Server Setup (Required Steps)

### Step 1: Connect to Production Server

```bash
ssh root@173.249.16.84
```

### Step 2: Create Bare Git Repository

A bare repository stores Git metadata without a working directory. It acts as a central hub for receiving pushes.

```bash
# Create directory for Git repositories
mkdir -p /var/repo

# Navigate to the directory
cd /var/repo

# Initialize bare repository
git init --bare biblioteca.git
```

**Why bare repository?**
- Designed to receive pushes from multiple sources
- Doesn't have a working directory (only Git metadata)
- Standard practice for server-side Git repositories

### Step 3: Create Deployment Directory

This is where your actual website files will be deployed.

```bash
# Create web directory (adjust path based on your web server config)
mkdir -p /var/www/biblioteca

# Set appropriate permissions
chown -R www-data:www-data /var/www/biblioteca
```

**Common deployment paths:**
- Nginx default: `/var/www/html` or `/usr/share/nginx/html`
- Apache default: `/var/www/html`
- Custom: Any path configured in your web server

### Step 4: Create Post-Receive Hook

The post-receive hook is a script that runs automatically after Git receives a push.

```bash
# Create the hook file
nano /var/repo/biblioteca.git/hooks/post-receive
```

**Paste this content:**

```bash
#!/bin/bash

# Configuration
TARGET="/var/www/biblioteca"
GIT_DIR="/var/repo/biblioteca.git"
BRANCH="main"

echo "===== Post-Receive Hook Started ====="

while read oldrev newrev ref
do
    # Extract branch name from ref
    RECEIVED_BRANCH=$(echo $ref | sed 's/refs\/heads\///')

    echo "Received push to branch: $RECEIVED_BRANCH"

    # Check if this is the main branch
    if [[ $RECEIVED_BRANCH = "$BRANCH" ]]; then
        echo "Deploying $BRANCH branch to production..."
        echo "Target directory: $TARGET"

        # Checkout files to deployment directory
        git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH

        if [ $? -eq 0 ]; then
            echo "✓ Deployment successful!"
            echo "Files deployed to: $TARGET"

            # Optional: Set permissions
            chown -R www-data:www-data $TARGET

            # Optional: Clear service worker cache version
            echo "Service worker will be updated on next visit"
        else
            echo "✗ Deployment failed!"
            exit 1
        fi
    else
        echo "Ignoring push to $RECEIVED_BRANCH branch (not $BRANCH)"
    fi
done

echo "===== Post-Receive Hook Completed ====="
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Make Hook Executable

```bash
chmod +x /var/repo/biblioteca.git/hooks/post-receive
```

**Verify permissions:**
```bash
ls -l /var/repo/biblioteca.git/hooks/post-receive
```

Should show: `-rwxr-xr-x` (executable)

### Step 6: Set Directory Permissions

```bash
# Git repository permissions
chown -R root:root /var/repo/biblioteca.git

# Web directory permissions (adjust user:group for your web server)
chown -R www-data:www-data /var/www/biblioteca

# Make directories readable
chmod -R 755 /var/www/biblioteca
```

**User/Group options:**
- Ubuntu/Debian nginx: `www-data:www-data`
- CentOS/RHEL nginx: `nginx:nginx`
- Apache: `www-data:www-data` or `apache:apache`

### Step 7: Configure Web Server (If Not Already Done)

**For Nginx:**

```bash
nano /etc/nginx/sites-available/biblioteca
```

**Basic configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or IP address

    root /var/www/biblioteca;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|mp3)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker should not be cached
    location ~* (sw\.js|manifest\.json)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

**Enable site and reload:**
```bash
ln -s /etc/nginx/sites-available/biblioteca /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 8: Test Connection from Local Machine

Exit the SSH session and return to your local machine:

```bash
exit
```

Test SSH connection:
```bash
ssh root@173.249.16.84 "echo 'Connection successful'"
```

## Part 3: Deploying Changes

### Option 1: Push to Production Only

```bash
git push production main
```

### Option 2: Push to GitHub Only

```bash
git push origin main
```

### Option 3: Push to Both Remotes

```bash
# Sequential push
git push origin main && git push production main

# Or create an alias (add to ~/.gitconfig or .git/config)
[alias]
    deploy = "!git push origin main && git push production main"

# Then use:
git deploy
```

### Option 4: Push to Multiple Remotes at Once

```bash
# Add to .git/config
git config -e
```

Add this section:

```ini
[remote "all"]
    url = https://github.com/bacanapps/biblioteca.git
    url = root@173.249.16.84:/var/repo/biblioteca.git
```

Then push to both:
```bash
git push all main
```

## Workflow Example

**1. Make changes to your code:**
```bash
# Edit files
nano app.js

# Stage changes
git add .

# Commit changes
git commit -m "Update feature X"
```

**2. Deploy to production:**
```bash
# Push to both GitHub and production
git push origin main && git push production main
```

**3. Verify deployment:**
```bash
# SSH to server and check files
ssh root@173.249.16.84 "ls -la /var/www/biblioteca"

# Or visit your website
curl http://your-server-ip/
```

## Troubleshooting

### Issue: Permission Denied

**Error:**
```
Permission denied (publickey,password)
```

**Solution:**
- Ensure SSH key is added to server's `~/.ssh/authorized_keys`
- Or use password authentication (less secure)

### Issue: Hook Not Executing

**Error:**
Hook runs but files aren't deployed

**Solutions:**
```bash
# Check hook is executable
ls -l /var/repo/biblioteca.git/hooks/post-receive

# Check hook syntax
bash -n /var/repo/biblioteca.git/hooks/post-receive

# View hook output by pushing and watching
tail -f /var/log/syslog  # on server while pushing
```

### Issue: Files Not Updating

**Possible causes:**
1. Wrong TARGET path in hook
2. Permission issues
3. Wrong branch name

**Debug:**
```bash
# Check current deployment
ssh root@173.249.16.84 "cd /var/www/biblioteca && git log -1"

# Manually trigger deployment
ssh root@173.249.16.84 "cd /var/repo/biblioteca.git && GIT_DIR=/var/repo/biblioteca.git git --work-tree=/var/www/biblioteca checkout -f main"
```

### Issue: Service Worker Caching Old Files

**Solution:**
Update version in `sw.js` to force cache refresh:

```javascript
const VERSION = "v2";  // Increment this
```

Or clear cache programmatically in post-receive hook:

```bash
# Add to hook
find $TARGET -name "sw.js" -exec sed -i 's/VERSION = "v[0-9]*"/VERSION = "v'$(date +%s)'"/' {} \;
```

## Security Considerations

### 1. Use SSH Keys (Recommended)

```bash
# Generate SSH key locally (if not already done)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to server
ssh-copy-id root@173.249.16.84
```

### 2. Restrict Hook Permissions

```bash
# Hook should only be writable by root
chmod 755 /var/repo/biblioteca.git/hooks/post-receive
chown root:root /var/repo/biblioteca.git/hooks/post-receive
```

### 3. Create Dedicated Deployment User (More Secure)

Instead of using root:

```bash
# On server, create deployment user
adduser --disabled-password deployer
usermod -aG www-data deployer

# Change repository ownership
chown -R deployer:deployer /var/repo/biblioteca.git
chown -R deployer:www-data /var/www/biblioteca

# Update local remote
git remote set-url production deployer@173.249.16.84:/var/repo/biblioteca.git
```

### 4. Restrict SSH Access

Edit `/etc/ssh/sshd_config`:

```bash
# Only allow specific users
AllowUsers deployer

# Disable root login
PermitRootLogin no

# Restart SSH
systemctl restart sshd
```

## Advanced: Automated Testing in Hook

Add tests to post-receive hook before deployment:

```bash
#!/bin/bash
TARGET="/var/www/biblioteca"
GIT_DIR="/var/repo/biblioteca.git"
BRANCH="main"
TMP_WORK="/tmp/biblioteca-test"

while read oldrev newrev ref
do
    if [[ $ref = refs/heads/"$BRANCH" ]]; then
        echo "Running pre-deployment tests..."

        # Checkout to temporary directory
        mkdir -p $TMP_WORK
        git --work-tree=$TMP_WORK --git-dir=$GIT_DIR checkout -f $BRANCH

        # Run tests (example: check for required files)
        if [ ! -f "$TMP_WORK/index.html" ]; then
            echo "ERROR: index.html missing!"
            rm -rf $TMP_WORK
            exit 1
        fi

        # Tests passed, deploy
        echo "Tests passed, deploying..."
        git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH

        # Cleanup
        rm -rf $TMP_WORK
        echo "Deployment complete!"
    fi
done
```

## Monitoring Deployments

### View Hook Logs

Add logging to hook:

```bash
#!/bin/bash
LOG_FILE="/var/log/biblioteca-deploy.log"

# Redirect all output to log
exec >> $LOG_FILE 2>&1

echo "===== Deployment started at $(date) ====="
# ... rest of hook ...
echo "===== Deployment completed at $(date) ====="
```

View logs:
```bash
ssh root@173.249.16.84 "tail -f /var/log/biblioteca-deploy.log"
```

## Resources

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Deploying with Git](https://git-scm.com/book/en/v2/Git-on-the-Server-Getting-Git-on-a-Server)
- [Nginx Configuration](https://nginx.org/en/docs/)

## Summary Checklist

Server setup:
- [ ] SSH access confirmed
- [ ] Bare repository created at `/var/repo/biblioteca.git`
- [ ] Deployment directory created at `/var/www/biblioteca`
- [ ] Post-receive hook created and made executable
- [ ] Permissions set correctly
- [ ] Web server configured
- [ ] First deployment tested

Local setup:
- [x] Production remote added
- [ ] Deployment workflow documented
- [ ] Team members informed

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review hook logs: `/var/log/biblioteca-deploy.log`
3. Test manual deployment via SSH
4. Verify web server configuration
