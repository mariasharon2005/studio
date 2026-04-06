{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.docker
  ];
  services.docker.enable = true;
  idx = {
    extensions = [
      "christian-kohler.path-intellisense"
    ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}