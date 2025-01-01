import { standardSignals } from "./common.js";
import type { SystemdValueEnum } from "./types";

const manPage = "podman-systemd.unit.5";
export const podmanValueEnum: ReadonlyArray<SystemdValueEnum> = [
    {
        directive: "AutoUpdate",
        section: "Container",
        manPage,
        docs: {
            registry:
                "Requires a fully-qualified image reference (e.g., quay.io/podman/stable:latest) to be used to create the container. This enforcement is necessary to know which image to actually check and pull. If an image ID was used, Podman does not know which image to check/pull anymore.",
            local: "Tells Podman to compare the image a container is using to the image with its raw name in local storage. If an image is updated locally, Podman simply restarts the systemd unit executing the container.",
        },
    },
    {
        directive: "AutoUpdate",
        section: "Kube",
        manPage,
        docs: {
            registry:
                "Requires a fully-qualified image reference (e.g., quay.io/podman/stable:latest) to be used to create the container. This enforcement is necessary to know which images to actually check and pull. If an image ID was used, Podman does not know which image to check/pull anymore.",
            local: "Tells Podman to compare the image a container is using to the image with its raw name in local storage. If an image is updated locally, Podman simply restarts the systemd unit executing the Kubernetes Quadlet.",
            "${name}/${local|registry}":
                "Tells Podman to perform the `local` or `registry` autoupdate on the specified container name.",
        },
    },
    {
        directive: "ExitCodePropagation",
        section: "Container",
        manPage,
        docs: {
            all: `exit non-zero if all containers have failed (i.e., exited non-zero)`,
            any: `exit non-zero if any container has failed`,
            none: `exit zero and ignore failed containers`,
        },
    },
    {
        directive: "StopSignal",
        section: "Container",
        manPage,
        tips: { SIGTERM: "default" },
        docs: standardSignals,
    },
];
