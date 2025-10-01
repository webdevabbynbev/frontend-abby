import React from "react";
import { useState, useEffect } from "react";
import { AddressCard, Button, TxtField, DialogCard } from "@/components";
import {
  FaVenus,
  FaCopy,
  FaMars,
  FaPhone,
  FaEnvelope,
  FaSignOutAlt,
  FaRightFromBracket,
  FaUserXmark,
} from "react-icons/fa6";

export function Profilepage() {

  const [user, setUser] 

  return (
    <div className="bg-transparent w-full justify-center h-auto space-y-4">
      <div className="title px-4 text-neutral-500">
        <h1 className="font-bold text-neutral-950 text-xl">
          Profile
        </h1>
      </div>
      <div className="container rounded-2xl bg-white p-4 space-y-4">
        <div className="flex sm:flex-col md:flex-row w-full h-auto md:items-center sm:items-start justify-between gap-4">
          <div className="avatar rounded-full h-[100px] min-w-[100px] bg-neutral-400 animate-pulse" />
          <div className="profile-data w-full items-start flex-row space-y-2">
            <div className="space-y-2">
              <div className="name flex text-lg font-medium space-x-2 space-y-2  items-center">
                <p className="firstname" value="first-name">
                  Randy orton
                </p>
                <div className="items-center justify-center">
                  <span className="Gender items-center w-fit flex space-x-2 text-xs text-blue-400 bg-blue-100 py-1 px-2 rounded-full">
                    <FaMars className=" h-4 w-4" />
                    <p className="font-bold text-sm">Male</p>
                  </span>
                </div>
              </div>

              <div className="phone-and-email flex sm:flex-col md:flex-row text-sm text-neutral-600 font-normal gap-4 w-full h-auto">
                <div
                  className="flex items-center py-2 px-4 bg-neutral-50 border-1 rounded-full h-auto w-fit"
                  value="phone-number"
                >
                  <span className="space-x-4 flex items-center">
                    <p>08712361238</p>
                    <FaCopy className="h-4 w-4 text-neutral-300" />
                  </span>
                </div>
                <div
                  className="flex items-center space-x-2 py-2 px-4 bg-neutral-50 border-1 rounded-full h-auto w-fit"
                  value="email"
                >
                  <span className="space-x-4 flex items-center">
                    <p>pstoawkr@gmail.com</p>
                    <FaCopy className="h-4 w-4 text-neutral-300" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 space-x-2 w-full h-auto flex md:flex-col sm:items-start sm:justify-start md:items-end md:justify-end">
            <Button variant="tertiary" size="sm" iconName="Edit" className="">
              Edit profile
            </Button>

            <Button variant="tertiary" size="sm" iconName="" className="">
              Change password
            </Button>
          </div>
        </div>
        <div className="p-4 font-medium text-base bg-neutral-50 border-1 border-neutral-100 w-full rounded-2xl space-y-6">
          <div className="flex w-full items-center justify-between">
            <h3 className="font-bold">Address list</h3>
            <Button variant="primary" size="sm" iconName="Plus">
              Add new address
            </Button>
          </div>
          <div className="AddressCard">
            <AddressCard />
          </div>
        </div>

        <div className="p-4 font-medium text-base space-y-6 bg-neutral-50 border-1 border-neutral-100 w-full rounded-2xl">
          <div className="flex w-full items-center justify-between">
            <h3 className="font-bold">Account management</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <DialogCard className="">
              <div className="flex items-center space-x-2">
                <span>
                  <FaRightFromBracket />
                </span>
                <h2 className="font-bold text-base">Sign out?</h2>
              </div>

              <p className="text-sm text-neutral-600 bg-neutral-100 p-4 rounded-xl">
                You're signing out from your beauty space. We'll be here when
                you're ready to come back — with your favorites saved and
                waiting.
              </p>

              <Button variant="primary" size="sm">
                Sign out
              </Button>
            </DialogCard>

            <DialogCard className="">
              <div className="flex items-center space-x-2">
                <span>
                  <FaUserXmark />
                </span>
                <h2 className="font-bold text-base">Deactive account</h2>
              </div>

              <p className="text-sm text-neutral-600 bg-neutral-100 p-4 rounded-xl">
                Once you proceed, your account and all associated data will be
                permanently deleted. This action cannot be undone.
              </p>

              <Button variant="error" size="sm">
                Deactive account
              </Button>
            </DialogCard>
          </div>
        </div>
      </div>
    </div>
  );
}
