{
  inputs = {
    systems.url = "github:nix-systems/default";
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
      systems,
    }:
    let
      forEachSystem =
        f:
        nixpkgs.lib.genAttrs (import systems) (
          system:
          f {
            pkgs = import nixpkgs {
              inherit system;
              overlays = [
                (self: super: {
                  # yarn = super.yarn.override {
                  #   nodejs = super.nodejs_24;
                  # };
                  # yarn-berry = super.yarn.override {
                  #   nodejs = super.nodejs_22;
                  # };
                  # pnpm = super.pnpm.override {
                  #   nodejs = super.nodejs_22;
                  # };
                })
              ];
            };
          }
        );
    in
    {
      devShells = forEachSystem (
        { pkgs }:
        {
          default = pkgs.mkShellNoCC {
            packages = [
              pkgs.nodejs_24
              # pkgs.yarn
              # pkgs.yarn-berry
              # pkgs.pnpm
              pkgs.pnpm_8
              # pkgs.pnpm_10

            ];
            shellHook = ''
              echo "Welcome to your Node.js development environment!"
              echo "Node.js $(node -v)"
            '';
          };
        }
      );
    };
}
