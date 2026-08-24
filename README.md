# Calculadora + El Cameleon

Public source repository for the Calculadora mortgage-first financial tools site and El Cameleon publishing ecosystem.

## Product structure

- Calculadora: mortgage calculator first, then connected financial tools and resources.
- El Cameleon: free newsletter/public editorial layer plus premium weekly research.
- Premium content should not be stored as public static HTML in this repository.
- Stripe secret keys and webhook signing secrets must only live in secure environment variables / server-side functions.
- Amigo Gas, Bid Stac, Sign Stac, DirectLend, La Pulga and other ecosystem apps can be linked from the public site as their production URLs become available.

## Deployment

Target Netlify project: `calculadora-network`.

For a static deploy, Netlify should publish the repository root. No build command is required unless the project is later migrated to a framework.

## Security

Never commit Stripe secret keys, webhook secrets, private subscriber data, or gated premium article bodies to this public repository.
