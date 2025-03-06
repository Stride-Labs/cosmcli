#!/usr/bin/env node

import { Command } from "commander";
import { sayHello, listItems } from "./commands";

const program = new Command();

// Set CLI metadata
program
  .name("ts-cli-tool")
  .description("A TypeScript CLI example")
  .version("0.1.0");

// Define commands
program
  .command("hello")
  .description("Say hello to someone")
  .argument("[name]", "Name of the person to greet")
  .action((name) => {
    sayHello(name);
  });

program
  .command("list")
  .description("List items")
  .action(() => {
    listItems(["TypeScript", "Node.js", "Commander", "Chalk"]);
  });

// Parse command line arguments
program.parse();
