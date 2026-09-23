using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SKContact;

public class MainForm : Form
{
    private static readonly (string Res, string Out)[] WebFiles =
    {
        ("SKContact.www.index.html", "index.html"),
        ("SKContact.www.style.css", "style.css"),
        ("SKContact.www.app.js", "app.js"),
        ("SKContact.www.logo.png", "logo.png"),
        ("SKContact.www.favicon.png", "favicon.png"),
        ("SKContact.www.animated-stickers.heart.svg", "animated-stickers/heart.svg"),
        ("SKContact.www.animated-stickers.star.svg", "animated-stickers/star.svg"),
        ("SKContact.www.animated-stickers.fire.svg", "animated-stickers/fire.svg"),
        ("SKContact.www.animated-stickers.thumbs.svg", "animated-stickers/thumbs.svg"),
        ("SKContact.www.animated-stickers.rocket.svg", "animated-stickers/rocket.svg"),
        ("SKContact.www.animated-stickers.party.svg", "animated-stickers/party.svg"),
        ("SKContact.www.animated-stickers.smile.svg", "animated-stickers/smile.svg"),
        ("SKContact.www.animated-stickers.ghost.svg", "animated-stickers/ghost.svg")
    };

    private readonly WebView2 _web = new() { Dock = DockStyle.Fill };

    public MainForm()
    {
        Text = "СК Контакт";
        ClientSize = new Size(1180, 760);
        MinimumSize = new Size(820, 560);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(14, 22, 33);

        using (var iconStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("SKContact.app.ico"))
        {
            if (iconStream != null) Icon = new Icon(iconStream);
        }

        Controls.Add(_web);

        var appData = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SKContact");
        Directory.CreateDirectory(appData);
        var www = Path.Combine(appData, "www");
        ExtractWeb(www);

        Shown += async (_, _) =>
        {
            try
            {
                var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(appData, "WebView2"));
                await _web.EnsureCoreWebView2Async(env);
                _web.CoreWebView2.Navigate("file:///" + Path.Combine(www, "index.html").Replace('\\', '/'));
            }
            catch (Exception ex)
            {
                MessageBox.Show("Не удалось запустить WebView2: " + ex.Message,
                    "СК Контакт", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        };
    }

    private static void ExtractWeb(string www)
    {
        Directory.CreateDirectory(www);
        Directory.CreateDirectory(Path.Combine(www, "animated-stickers"));

        var asm = Assembly.GetExecutingAssembly();
        foreach (var (res, outPath) in WebFiles)
        {
            using var s = asm.GetManifestResourceStream(res);
            if (s == null) continue;
            var full = Path.Combine(www, outPath);
            using var fs = File.Create(full);
            s.CopyTo(fs);
        }
    }
}