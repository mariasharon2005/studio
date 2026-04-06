{ pkgs, ... }: {
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_20
    pkgs.docker
  ];
  idx = {
    extensions = [
      "ms-azuretools.vscode-docker"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };
  # Enable Docker service in the environment
  services.docker.enable = true;
}