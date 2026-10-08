# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Naoise McG
{
	inputs = {
		nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
		rust-overlay = {
			url = "github:oxalica/rust-overlay";
			inputs.nixpkgs.follows = "nixpkgs";
		};
		flake-utils.url = "github:numtide/flake-utils";
	};

	outputs = { self, nixpkgs, rust-overlay, flake-utils}:
		flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ] (system:
			let
				overlays = [ (import rust-overlay) ];
				pkgs = import nixpkgs { inherit system overlays; };

				maps-server = pkgs.rustPlatform.buildRustPackage {
					pname = "maps-server";
					version = "0.1.0";

					src = ./.;

					cargoLock = {
						lockFile = ./Cargo.lock;
					};

					nativeCheckInputs = [ pkgs.python3 ];
				};

				overpassImageName = "wiktorn/overpass-api";
				overpassImageTag = "v0.7.62.9";
				overpassImageRef = "${overpassImageName}:${overpassImageTag}";
				overpassImage = pkgs.dockerTools.pullImage {
					imageName = overpassImageName;
					imageDigest = "sha256:24452bbe5a82562b0df04beffeca97b7ce3b41ce2b5d30e6839fe705a67b1e6f";
					sha256 = {
						x86_64-linux = "sha256-9ZndUVwzElf8C79EUkzY7mKGD5tUy9hJ3izj3nbz+RM=";
						aarch64-linux = "sha256-4wG0FibS4BLUsMMhNf3BBBg5FBwTqol5qL21EAQFa2o=";
						aarch64-darwin = "sha256-4wG0FibS4BLUsMMhNf3BBBg5FBwTqol5qL21EAQFa2o=";
					}.${system};
					finalImageName = overpassImageName;
					finalImageTag = overpassImageTag;
				};

			in {
				devShells.default = pkgs.mkShell {
					packages = with pkgs; [
						git
						rust-bin.stable.latest.default
						osmium-tool
						bugstalker
					];
				};

				packages.default = maps-server;

				apps = {
					default = {
						type = "app";
						program = "${pkgs.writeShellScriptBin "maps-server-wrapper" ''
							if [ -z "''${MAPS_OVERPASS_IMAGE:-}" ]; then
								export MAPS_OVERPASS_IMAGE="${overpassImageRef}"
								if ! ${pkgs.docker}/bin/docker image inspect "${overpassImageRef}" >/dev/null 2>&1; then
									echo "Loading Overpass image ${overpassImageRef} into Docker daemon from Nix store..."
									${pkgs.docker}/bin/docker load -i ${overpassImage}
								fi
							fi
							exec ${self.packages.${system}.default}/bin/maps-server "$@"
						''}/bin/maps-server-wrapper";
					};
				};
			});
}
